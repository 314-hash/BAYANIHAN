// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract DiasporaNetwork is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant DIASPORA_ADMIN_ROLE = keccak256("DIASPORA_ADMIN_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;

    uint256 public constant BASE_DIASPORA_REWARD = 30 * 10**18; // 30 BAYANI
    uint256 public poolCounter;

    struct OFWProfile {
        string workCountry;
        uint256 registrationTime;
        uint256 totalInvested;
        uint256 totalLent;
        uint256 totalDonated;
        uint256 jobsCreatedCount;
        uint256 lastRewardThreshold; // last impact score milestone rewarded
    }

    struct LendingPool {
        uint256 id;
        address borrower;
        uint256 targetAmount;
        uint256 interestRateBps;
        uint256 duration;
        uint256 currentFunding;
        uint256 totalRepaid;
        bool funded;
        bool active;
        bool completed;
    }

    mapping(address => OFWProfile) public ofwProfiles;
    mapping(uint256 => LendingPool) public lendingPools;
    
    // Pool ID => OFW Address => Amount Funded
    mapping(uint256 => mapping(address => uint256)) public poolContributions;

    event OFWRegistered(address indexed ofw, string country);
    event InvestmentLogged(address indexed ofw, address indexed target, uint256 amount);
    event LoanPoolCreated(uint256 indexed poolId, address indexed borrower, uint256 target);
    event LoanPoolFunded(uint256 indexed poolId, address indexed ofw, uint256 amount);
    event LoanDisbursed(uint256 indexed poolId, address indexed borrower);
    event LoanRepaid(uint256 indexed poolId, uint256 amount);
    event OFWWithdrawal(uint256 indexed poolId, address indexed ofw, uint256 amount);
    event DiasporaDonation(address indexed ofw, address indexed recipient, uint256 amount);
    event JobsCreatedUpdated(address indexed ofw, uint256 totalJobs);
    event ImpactRewardClaimed(address indexed ofw, uint256 rewardAmount, uint256 currentScore);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _bayaniToken
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        bayaniToken = IERC20(_bayaniToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(DIASPORA_ADMIN_ROLE, msg.sender);
    }

    modifier onlyVerifiedOFW() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Citizen not verified");
        require(quantumIdentity.getCitizenType(msg.sender) == 5, "User is not registered OFW");
        _;
    }

    function registerOFW(string calldata country) external onlyVerifiedOFW {
        require(ofwProfiles[msg.sender].registrationTime == 0, "Already registered");
        ofwProfiles[msg.sender] = OFWProfile({
            workCountry: country,
            registrationTime: block.timestamp,
            totalInvested: 0,
            totalLent: 0,
            totalDonated: 0,
            jobsCreatedCount: 0,
            lastRewardThreshold: 0
        });
        emit OFWRegistered(msg.sender, country);
    }

    function logInvestment(address targetProject, uint256 amount) external onlyVerifiedOFW whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be > 0");
        bayaniToken.safeTransferFrom(msg.sender, targetProject, amount);

        ofwProfiles[msg.sender].totalInvested += amount;
        emit InvestmentLogged(msg.sender, targetProject, amount);
        
        _checkImpactMilestones(msg.sender);
    }

    function createLendingPool(
        uint256 targetAmount,
        uint256 interestRateBps,
        uint256 duration
    ) external whenNotPaused returns (uint256) {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Borrower must be verified citizen");
        require(targetAmount > 0, "Target must be > 0");
        require(interestRateBps <= 2000, "Interest cap at 20%"); // Cap interest rate at 20% to avoid exploitative rates

        poolCounter++;
        uint256 poolId = poolCounter;

        lendingPools[poolId] = LendingPool({
            id: poolId,
            borrower: msg.sender,
            targetAmount: targetAmount,
            interestRateBps: interestRateBps,
            duration: duration,
            currentFunding: 0,
            totalRepaid: 0,
            funded: false,
            active: false,
            completed: false
        });

        emit LoanPoolCreated(poolId, msg.sender, targetAmount);
        return poolId;
    }

    function fundLendingPool(uint256 poolId, uint256 amount) external onlyVerifiedOFW whenNotPaused nonReentrant {
        LendingPool storage pool = lendingPools[poolId];
        require(!pool.funded, "Pool already funded");
        require(pool.currentFunding + amount <= pool.targetAmount, "Funding exceeds target");

        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        pool.currentFunding += amount;
        poolContributions[poolId][msg.sender] += amount;

        ofwProfiles[msg.sender].totalLent += amount;

        emit LoanPoolFunded(poolId, msg.sender, amount);

        if (pool.currentFunding == pool.targetAmount) {
            pool.funded = true;
            pool.active = true;
        }

        _checkImpactMilestones(msg.sender);
    }

    function claimLendingPayout(uint256 poolId) external whenNotPaused nonReentrant {
        LendingPool storage pool = lendingPools[poolId];
        require(pool.funded, "Lending pool not fully funded");
        require(msg.sender == pool.borrower, "Only borrower can claim payout");
        require(pool.active, "Loan already claimed or inactive");

        pool.active = false; // set to false as disbursed
        bayaniToken.safeTransfer(pool.borrower, pool.targetAmount);

        emit LoanDisbursed(poolId, pool.borrower);
    }

    function repayLendingLoan(uint256 poolId, uint256 amount) external whenNotPaused nonReentrant {
        LendingPool storage pool = lendingPools[poolId];
        require(pool.funded, "Loan not funded");
        require(!pool.completed, "Loan already repaid");
        require(msg.sender == pool.borrower, "Only borrower can repay");

        uint256 interest = (pool.targetAmount * pool.interestRateBps) / 10000;
        uint256 totalDebt = pool.targetAmount + interest;
        uint256 payment = amount > (totalDebt - pool.totalRepaid) ? (totalDebt - pool.totalRepaid) : amount;

        bayaniToken.safeTransferFrom(msg.sender, address(this), payment);
        pool.totalRepaid += payment;

        emit LoanRepaid(poolId, payment);

        if (pool.totalRepaid >= totalDebt) {
            pool.completed = true;
        }
    }

    function ofwWithdrawRepayments(uint256 poolId) external onlyVerifiedOFW nonReentrant {
        LendingPool memory pool = lendingPools[poolId];
        require(pool.funded, "Pool not funded");
        uint256 ofwContribution = poolContributions[poolId][msg.sender];
        require(ofwContribution > 0, "No funding history");

        // Calculate payout share (contribution / target * totalRepaid)
        uint256 totalEarned = (ofwContribution * pool.totalRepaid) / pool.targetAmount;
        
        // Zero out to prevent re-withdrawal
        poolContributions[poolId][msg.sender] = 0;
        
        bayaniToken.safeTransfer(msg.sender, totalEarned);
        emit OFWWithdrawal(poolId, msg.sender, totalEarned);
    }

    function donateToProject(address recipient, uint256 amount) external onlyVerifiedOFW whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be > 0");
        bayaniToken.safeTransferFrom(msg.sender, recipient, amount);

        ofwProfiles[msg.sender].totalDonated += amount;
        emit DiasporaDonation(msg.sender, recipient, amount);

        _checkImpactMilestones(msg.sender);
    }

    function updateOFWJobsCreated(address ofw, uint256 jobsCount) external onlyRole(DIASPORA_ADMIN_ROLE) {
        require(ofwProfiles[ofw].registrationTime > 0, "OFW not registered");
        ofwProfiles[ofw].jobsCreatedCount = jobsCount;
        emit JobsCreatedUpdated(ofw, jobsCount);

        _checkImpactMilestones(ofw);
    }

    // Impact Score Calculation: 1 point per 100 BAYANI invested/lent/donated + 10 points per job created
    function getDiasporaImpactScore(address ofw) public view returns (uint256) {
        OFWProfile memory profile = ofwProfiles[ofw];
        if (profile.registrationTime == 0) return 0;

        uint256 financialImpact = (profile.totalInvested + profile.totalLent + profile.totalDonated) / (100 * 10**18);
        uint256 jobImpact = profile.jobsCreatedCount * 10;

        return financialImpact + jobImpact;
    }

    function _checkImpactMilestones(address ofw) internal {
        uint256 currentScore = getDiasporaImpactScore(ofw);
        OFWProfile storage profile = ofwProfiles[ofw];
        
        // Every 50 points increase in impact score grants a Diaspora reward from Treasury (OFWs category)
        uint256 milestones = currentScore / 50;
        if (milestones > profile.lastRewardThreshold) {
            uint256 claimCount = milestones - profile.lastRewardThreshold;
            profile.lastRewardThreshold = milestones;

            uint256 rewardAmount = BASE_DIASPORA_REWARD * claimCount;
            rewardsTreasury.claimRewards(ofw, rewardAmount, INationalRewardsTreasury.AllocationCategory.EcosystemRewards);

            emit ImpactRewardClaimed(ofw, rewardAmount, currentScore);
        }
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
