// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract HousingCooperative is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant COOP_ADMIN_ROLE = keccak256("COOP_ADMIN_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;

    uint256 public constant HOUSING_STREAK_REWARD = 50 * 10**18; // 50 BAYANI
    uint256 public projectCounter;
    uint256 public mortgageCounter;

    struct Project {
        uint256 id;
        string locationDetails;
        uint256 targetFunding;
        uint256 currentFunding;
        bool closed;
        bool completed;
    }

    struct Mortgage {
        uint256 id;
        address borrower;
        uint256 loanAmount;
        uint256 outstandingBalance;
        uint256 monthlyInstallment;
        uint256 lastPaymentTime;
        uint256 consecutivePayments;
        uint256 nextPaymentDeadline;
        bool isApproved;
        bool isPaidOff;
    }

    mapping(uint256 => Project) public projects;
    // Project ID => User => Share Balance
    mapping(uint256 => mapping(address => uint256)) public projectShares;
    
    mapping(uint256 => Mortgage) public mortgages;
    // Member Address => Mortgage ID list
    mapping(address => uint256[]) public memberMortgages;

    event ProjectAdded(uint256 indexed projectId, string location, uint256 target);
    event EquityContributed(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event MortgageApplied(uint256 indexed mortgageId, address indexed borrower, uint256 amount);
    event MortgageApproved(uint256 indexed mortgageId, address indexed borrower);
    event InstallmentPaid(uint256 indexed mortgageId, address indexed borrower, uint256 amount, uint256 remaining);
    event MortgageRewardGranted(address indexed borrower, uint256 rewardAmount);

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
        _grantRole(COOP_ADMIN_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Only verified citizens");
        _;
    }

    function addProject(string calldata location, uint256 targetFunding) external onlyRole(COOP_ADMIN_ROLE) {
        require(targetFunding > 0, "Target funding must be > 0");
        projectCounter++;
        projects[projectCounter] = Project({
            id: projectCounter,
            locationDetails: location,
            targetFunding: targetFunding,
            currentFunding: 0,
            closed: false,
            completed: false
        });
        emit ProjectAdded(projectCounter, location, targetFunding);
    }

    function contributeToProject(uint256 projectId, uint256 amount) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        Project storage proj = projects[projectId];
        require(proj.id > 0, "Project does not exist");
        require(!proj.closed, "Funding is closed");
        require(proj.currentFunding + amount <= proj.targetFunding, "Contribution exceeds target limit");

        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        proj.currentFunding += amount;
        projectShares[projectId][msg.sender] += amount;

        emit EquityContributed(projectId, msg.sender, amount);

        if (proj.currentFunding == proj.targetFunding) {
            proj.closed = true;
        }
    }

    function applyForMortgage(uint256 loanAmount, uint256 installmentAmount) external onlyVerifiedCitizen whenNotPaused returns (uint256) {
        require(loanAmount > 0, "Loan amount must be > 0");
        require(installmentAmount > 0, "Installment must be > 0");
        require(installmentAmount <= loanAmount, "Installment cannot exceed loan");

        mortgageCounter++;
        uint256 mortgageId = mortgageCounter;

        mortgages[mortgageId] = Mortgage({
            id: mortgageId,
            borrower: msg.sender,
            loanAmount: loanAmount,
            outstandingBalance: loanAmount,
            monthlyInstallment: installmentAmount,
            lastPaymentTime: 0,
            consecutivePayments: 0,
            nextPaymentDeadline: 0,
            isApproved: false,
            isPaidOff: false
        });

        memberMortgages[msg.sender].push(mortgageId);

        emit MortgageApplied(mortgageId, msg.sender, loanAmount);
        return mortgageId;
    }

    function approveMortgage(uint256 mortgageId) external onlyRole(COOP_ADMIN_ROLE) whenNotPaused nonReentrant {
        Mortgage storage mort = mortgages[mortgageId];
        require(mort.loanAmount > 0, "Mortgage does not exist");
        require(!mort.isApproved, "Mortgage already approved");

        // Verify coop treasury has enough funds
        require(bayaniToken.balanceOf(address(this)) >= mort.loanAmount, "Insufficient treasury cash reserves");

        mort.isApproved = true;
        mort.nextPaymentDeadline = block.timestamp + 30 days;

        // Disburse loan to borrower
        bayaniToken.safeTransfer(mort.borrower, mort.loanAmount);

        emit MortgageApproved(mortgageId, mort.borrower);
    }

    function payMortgageInstallment(uint256 mortgageId, uint256 amount) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        Mortgage storage mort = mortgages[mortgageId];
        require(mort.isApproved, "Mortgage not approved");
        require(!mort.isPaidOff, "Mortgage already paid off");
        require(msg.sender == mort.borrower, "Only borrower can pay installment");
        require(amount > 0, "Payment must be > 0");

        uint256 payment = amount > mort.outstandingBalance ? mort.outstandingBalance : amount;
        bayaniToken.safeTransferFrom(msg.sender, address(this), payment);

        mort.outstandingBalance -= payment;
        mort.lastPaymentTime = block.timestamp;

        // Update payment streak
        if (block.timestamp <= mort.nextPaymentDeadline) {
            mort.consecutivePayments += 1;
        } else {
            mort.consecutivePayments = 1; // missed deadline, reset streak
        }

        // Set next deadline
        mort.nextPaymentDeadline = block.timestamp + 30 days;

        if (mort.outstandingBalance == 0) {
            mort.isPaidOff = true;
        }

        emit InstallmentPaid(mortgageId, msg.sender, payment, mort.outstandingBalance);

        // Good Standing reward: 12 consecutive payments = payout reward from Treasury (Cooperatives)
        if (mort.consecutivePayments >= 12) {
            mort.consecutivePayments = 0; // reset streak
            rewardsTreasury.claimRewards(msg.sender, HOUSING_STREAK_REWARD, INationalRewardsTreasury.AllocationCategory.CommunityTreasury);
            emit MortgageRewardGranted(msg.sender, HOUSING_STREAK_REWARD);
        }
    }

    function getMemberMortgages(address member) external view returns (uint256[] memory) {
        return memberMortgages[member];
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
