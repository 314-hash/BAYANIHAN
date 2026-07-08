// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/IAIReputationOracle.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract FreelancerEscrow is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IAIReputationOracle public immutable reputationOracle;
    IERC20 public immutable bayaniToken;

    uint256 public constant BASE_ESCROW_FEE_BPS = 200; // 2% fee
    uint256 public constant FREELANCER_BONUS_REWARD = 15 * 10**18; // 15 BAYANI
    uint256 public projectCounter;

    struct Project {
        address client;
        address freelancer;
        uint256 totalBudget;
        uint256 lockedAmount;
        uint256 completionTime;
        uint8 rating; // 1-5
        bool onTime;
        bool isDisputed;
        bool isCompleted;
    }

    struct Milestone {
        uint256 amount;
        uint256 deliveryDeadline;
        bool isSubmitted;
        bool isApproved;
    }

    mapping(uint256 => Project) public projects;
    // Project ID => Milestone ID => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    // Project ID => total milestones count
    mapping(uint256 => uint256) public milestoneCounts;
    // Project ID => current active milestone index
    mapping(uint256 => uint256) public currentMilestoneIndices;

    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 totalBudget);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId);
    event MilestoneApproved(uint256 indexed projectId, uint256 indexed milestoneId, uint256 payoutAmount);
    event MilestoneRefunded(uint256 indexed projectId, uint256 indexed milestoneId, uint256 refundAmount);
    event ProjectDisputed(uint256 indexed projectId, address indexed initiator);
    event DisputeResolved(uint256 indexed projectId, uint256 clientPayout, uint256 freelancerPayout);
    event ProjectCompleted(uint256 indexed projectId, uint8 rating, bool onTime, uint256 bonusAmount);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _reputationOracle,
        address _bayaniToken
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        reputationOracle = IAIReputationOracle(_reputationOracle);
        bayaniToken = IERC20(_bayaniToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
    }

    modifier onlyFreelancer(uint256 projectId) {
        require(msg.sender == projects[projectId].freelancer, "Only the assigned freelancer");
        _;
    }

    modifier onlyClient(uint256 projectId) {
        require(msg.sender == projects[projectId].client, "Only the client");
        _;
    }

    function createProject(
        address freelancer,
        uint256[] calldata milestoneAmounts,
        uint256[] calldata milestoneDeadlines
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer address");
        require(quantumIdentity.isCitizenVerified(freelancer), "Freelancer must be verified in identity");
        require(quantumIdentity.getCitizenType(freelancer) == 4, "User is not registered Freelancer");
        require(milestoneAmounts.length > 0, "At least one milestone is required");
        require(milestoneAmounts.length == milestoneDeadlines.length, "Lengths mismatch");

        projectCounter++;
        uint256 projectId = projectCounter;

        uint256 totalBudget = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneDeadlines[i] > block.timestamp, "Deadline must be future time");
            milestones[projectId][i] = Milestone({
                amount: milestoneAmounts[i],
                deliveryDeadline: milestoneDeadlines[i],
                isSubmitted: false,
                isApproved: false
            });
            totalBudget += milestoneAmounts[i];
        }

        projects[projectId] = Project({
            client: msg.sender,
            freelancer: freelancer,
            totalBudget: totalBudget,
            lockedAmount: totalBudget,
            completionTime: 0,
            rating: 0,
            onTime: false,
            isDisputed: false,
            isCompleted: false
        });

        milestoneCounts[projectId] = milestoneAmounts.length;
        currentMilestoneIndices[projectId] = 0;

        // Escrow total project budget
        bayaniToken.safeTransferFrom(msg.sender, address(this), totalBudget);

        emit ProjectCreated(projectId, msg.sender, freelancer, totalBudget);
        return projectId;
    }

    function submitMilestone(uint256 projectId) external onlyFreelancer(projectId) whenNotPaused {
        Project storage proj = projects[projectId];
        require(!proj.isCompleted, "Project completed");
        require(!proj.isDisputed, "Project disputed");

        uint256 activeIdx = currentMilestoneIndices[projectId];
        require(activeIdx < milestoneCounts[projectId], "All milestones completed");

        Milestone storage m = milestones[projectId][activeIdx];
        require(!m.isSubmitted, "Milestone already submitted");

        m.isSubmitted = true;
        emit MilestoneSubmitted(projectId, activeIdx);
    }

    function approveMilestone(uint256 projectId) external onlyClient(projectId) whenNotPaused nonReentrant {
        Project storage proj = projects[projectId];
        require(!proj.isCompleted, "Project completed");
        require(!proj.isDisputed, "Project disputed");

        uint256 activeIdx = currentMilestoneIndices[projectId];
        require(activeIdx < milestoneCounts[projectId], "All milestones completed");

        Milestone storage m = milestones[projectId][activeIdx];
        require(m.isSubmitted, "Milestone not submitted for approval");
        require(!m.isApproved, "Milestone already approved");

        m.isApproved = true;

        // Calculate fee based on reputation score
        uint8 score = reputationOracle.getReputationScore(proj.freelancer);
        
        // Fee reduction: Higher reputation reduces fee (capped at 50% discount)
        uint256 feeDiscountBps = (uint256(score) * BASE_ESCROW_FEE_BPS) / 200; // max 100% of fee discount basis points
        if (feeDiscountBps > BASE_ESCROW_FEE_BPS / 2) {
            feeDiscountBps = BASE_ESCROW_FEE_BPS / 2; // cap discount at 50%
        }
        uint256 netFeeBps = BASE_ESCROW_FEE_BPS - feeDiscountBps;

        uint256 fee = (m.amount * netFeeBps) / 10000;
        uint256 netPayout = m.amount - fee;

        proj.lockedAmount -= m.amount;
        currentMilestoneIndices[projectId]++;

        // Send payout to freelancer, fee remains in contract (governor can claim fees)
        bayaniToken.safeTransfer(proj.freelancer, netPayout);

        emit MilestoneApproved(projectId, activeIdx, netPayout);
    }

    function claimMilestoneRefund(uint256 projectId) external onlyClient(projectId) whenNotPaused nonReentrant {
        Project storage proj = projects[projectId];
        require(!proj.isCompleted, "Project completed");
        require(!proj.isDisputed, "Project disputed");

        uint256 activeIdx = currentMilestoneIndices[projectId];
        require(activeIdx < milestoneCounts[projectId], "All milestones completed");

        Milestone storage m = milestones[projectId][activeIdx];
        require(!m.isSubmitted, "Milestone already submitted");
        require(block.timestamp > m.deliveryDeadline, "Deadline has not passed");

        uint256 refundAmount = m.amount;
        proj.lockedAmount -= refundAmount;
        
        // Move to next milestone index
        currentMilestoneIndices[projectId]++;
        if (currentMilestoneIndices[projectId] == milestoneCounts[projectId]) {
            proj.isCompleted = true;
        }

        // Return payment back to client
        bayaniToken.safeTransfer(proj.client, refundAmount);

        emit MilestoneRefunded(projectId, activeIdx, refundAmount);
    }

    function disputeProject(uint256 projectId) external whenNotPaused {
        Project storage proj = projects[projectId];
        require(!proj.isCompleted, "Project completed");
        require(!proj.isDisputed, "Project already disputed");
        require(msg.sender == proj.client || msg.sender == proj.freelancer, "Only client or freelancer can initiate");

        proj.isDisputed = true;
        emit ProjectDisputed(projectId, msg.sender);
    }

    function resolveDispute(
        uint256 projectId,
        uint256 clientPayout,
        uint256 freelancerPayout
    ) external onlyRole(ARBITRATOR_ROLE) nonReentrant {
        Project storage proj = projects[projectId];
        require(proj.isDisputed, "Project not disputed");
        require(!proj.isCompleted, "Project completed");
        require(clientPayout + freelancerPayout == proj.lockedAmount, "Sum must equal locked amount");

        proj.lockedAmount = 0;
        proj.isCompleted = true;
        proj.isDisputed = false;

        if (clientPayout > 0) {
            bayaniToken.safeTransfer(proj.client, clientPayout);
        }
        if (freelancerPayout > 0) {
            bayaniToken.safeTransfer(proj.freelancer, freelancerPayout);
        }

        // Adjust Reputation downwards for dispute resolution fault (decrease freelancer rep score)
        uint8 currentRep = reputationOracle.getReputationScore(proj.freelancer);
        uint8 penalty = freelancerPayout < proj.totalBudget / 2 ? 15 : 5;
        uint8 newRep = currentRep > penalty ? currentRep - penalty : 0;
        reputationOracle.setReputationScore(proj.freelancer, newRep);

        emit DisputeResolved(projectId, clientPayout, freelancerPayout);
    }

    function completeProject(
        uint256 projectId,
        uint8 rating,
        bool onTime
    ) external onlyClient(projectId) whenNotPaused nonReentrant {
        Project storage proj = projects[projectId];
        require(!proj.isCompleted, "Project already completed");
        require(currentMilestoneIndices[projectId] == milestoneCounts[projectId], "Milestones remaining");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");

        proj.isCompleted = true;
        proj.completionTime = block.timestamp;
        proj.rating = rating;
        proj.onTime = onTime;

        uint256 bonusAmount = 0;
        if (rating == 5 && onTime) {
            bonusAmount = FREELANCER_BONUS_REWARD;
            // Claim freelancer bonus rewards from Treasury
            rewardsTreasury.claimRewards(proj.freelancer, bonusAmount, INationalRewardsTreasury.AllocationCategory.EcosystemRewards);
        }

        // Adjust Reputation upwards
        uint8 currentRep = reputationOracle.getReputationScore(proj.freelancer);
        uint256 repBoost = rating == 5 ? 5 : 2;
        if (onTime) repBoost += 3;
        uint8 newRep = uint8(currentRep + repBoost > 100 ? 100 : currentRep + repBoost);
        reputationOracle.setReputationScore(proj.freelancer, newRep);

        emit ProjectCompleted(projectId, rating, onTime, bonusAmount);
    }

    function withdrawFees(address recipient, uint256 amount) external onlyRole(GOVERNOR_ROLE) {
        bayaniToken.safeTransfer(recipient, amount);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
