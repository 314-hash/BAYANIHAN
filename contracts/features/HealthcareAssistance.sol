// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";
import "../mock/BayaniNFT.sol";

contract HealthcareAssistance is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MEDICAL_REVIEWER_ROLE = keccak256("MEDICAL_REVIEWER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;
    BayaniNFT public immutable healthcareNft;

    uint256 public constant MONTHLY_CONTRIBUTION_AMOUNT = 10 * 10**18; // 10 BAYANI
    uint256 public constant GOOD_HEALTH_REWARD = 20 * 10**18; // 20 BAYANI
    uint256 public claimCounter;

    struct MedicalClaim {
        uint256 id;
        address payable patient;
        uint256 requestedAmount;
        string incidentHash;
        bool approved;
        bool rejected;
        uint256 timeRequested;
    }

    struct HealthStatus {
        uint256 lastContributionTime;
        uint256 consecutiveMonthsPaid;
        uint256 lastClaimTime;
        bool inGoodStanding;
    }

    mapping(address => uint256) public healthcareSavings;
    mapping(address => HealthStatus) public healthStatuses;
    mapping(uint256 => MedicalClaim) public medicalClaims;

    event HealthSavingsDeposited(address indexed patient, uint256 amount);
    event HealthSavingsWithdrawn(address indexed patient, uint256 amount);
    event HealthPoolContributed(address indexed patient, uint256 amount);
    event MedicalClaimSubmitted(uint256 indexed claimId, address indexed patient, uint256 amount, string incidentHash);
    event MedicalClaimApproved(uint256 indexed claimId, address indexed patient, uint256 amount);
    event MedicalClaimRejected(uint256 indexed claimId, address indexed patient);
    event HealthyStatusAwarded(address indexed patient, uint256 rewardAmount);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _bayaniToken,
        address _healthcareNft
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        bayaniToken = IERC20(_bayaniToken);
        healthcareNft = BayaniNFT(_healthcareNft);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(MEDICAL_REVIEWER_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Only verified citizens");
        _;
    }

    // Healthcare Savings (personal escrowed reserves)
    function depositSavings(uint256 amount) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        require(amount > 0, "Cannot deposit zero");
        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        healthcareSavings[msg.sender] += amount;
        emit HealthSavingsDeposited(msg.sender, amount);
    }

    function withdrawSavings(uint256 amount) external nonReentrant {
        require(healthcareSavings[msg.sender] >= amount, "Insufficient savings balance");
        healthcareSavings[msg.sender] -= amount;
        bayaniToken.safeTransfer(msg.sender, amount);
        emit HealthSavingsWithdrawn(msg.sender, amount);
    }

    // Contribute to Community Health Pool
    function contributeToPool() external onlyVerifiedCitizen whenNotPaused nonReentrant {
        bayaniToken.safeTransferFrom(msg.sender, address(this), MONTHLY_CONTRIBUTION_AMOUNT);

        HealthStatus storage status = healthStatuses[msg.sender];
        uint256 timeSinceLast = block.timestamp - status.lastContributionTime;

        if (status.lastContributionTime == 0) {
            status.consecutiveMonthsPaid = 1;
        } else if (timeSinceLast <= 35 days) {
            status.consecutiveMonthsPaid += 1;
        } else {
            status.consecutiveMonthsPaid = 1; // broken payment streak, reset
        }

        status.lastContributionTime = block.timestamp;
        status.inGoodStanding = true;

        emit HealthPoolContributed(msg.sender, MONTHLY_CONTRIBUTION_AMOUNT);

        // Healthy participation logic: 6 consecutive months without claims = NFT & Treasury reward
        if (status.consecutiveMonthsPaid >= 6 && (block.timestamp - status.lastClaimTime > 180 days)) {
            // Reset streak to prevent duplicate double claims without contribution updates
            status.consecutiveMonthsPaid = 0;

            // Mint health status NFT representing active membership & health status
            healthcareNft.mint(msg.sender, 1, 1, ""); // Token ID 1 represents Health Champion Badge

            // Allocate reward from Treasury's EmergencyFund category
            rewardsTreasury.claimRewards(msg.sender, GOOD_HEALTH_REWARD, INationalRewardsTreasury.AllocationCategory.EmergencyFund);

            emit HealthyStatusAwarded(msg.sender, GOOD_HEALTH_REWARD);
        }
    }

    // Submit Emergency Claim
    function requestMedicalClaim(uint256 amount, string calldata incidentHash) external onlyVerifiedCitizen whenNotPaused returns (uint256) {
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(incidentHash).length > 0, "Incident hash is required");

        claimCounter++;
        uint256 claimId = claimCounter;

        medicalClaims[claimId] = MedicalClaim({
            id: claimId,
            patient: payable(msg.sender),
            requestedAmount: amount,
            incidentHash: incidentHash,
            approved: false,
            rejected: false,
            timeRequested: block.timestamp
        });

        emit MedicalClaimSubmitted(claimId, msg.sender, amount, incidentHash);
        return claimId;
    }

    // Medical Reviewer Role approval
    function approveMedicalClaim(uint256 claimId) external onlyRole(MEDICAL_REVIEWER_ROLE) whenNotPaused nonReentrant {
        MedicalClaim storage claim = medicalClaims[claimId];
        require(claim.timeRequested > 0, "Claim does not exist");
        require(!claim.approved && !claim.rejected, "Claim already completed");

        claim.approved = true;
        healthStatuses[claim.patient].lastClaimTime = block.timestamp;
        healthStatuses[claim.patient].consecutiveMonthsPaid = 0; // reset streak upon claims

        // Transfer funds from contract health pool (accumulated contributions) to patient
        require(bayaniToken.balanceOf(address(this)) >= claim.requestedAmount, "Insufficient pool reserves");
        bayaniToken.safeTransfer(claim.patient, claim.requestedAmount);

        emit MedicalClaimApproved(claimId, claim.patient, claim.requestedAmount);
    }

    function rejectMedicalClaim(uint256 claimId) external onlyRole(MEDICAL_REVIEWER_ROLE) whenNotPaused {
        MedicalClaim storage claim = medicalClaims[claimId];
        require(claim.timeRequested > 0, "Claim does not exist");
        require(!claim.approved && !claim.rejected, "Claim already completed");

        claim.rejected = true;
        emit MedicalClaimRejected(claimId, claim.patient);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
