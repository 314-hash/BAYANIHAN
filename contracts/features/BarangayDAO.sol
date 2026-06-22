// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract BarangayDAO is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;

    uint256 public constant VOTE_REWARD = 1 * 10**18; // 1 BAYANI reward for active participation
    uint256 public constant PROPOSAL_VOTING_PERIOD = 7 days;
    uint256 public proposalCounter;

    struct Proposal {
        uint256 id;
        string description;
        uint256 fundingRequest;
        address recipient;
        uint8 proposalType; // 0: Infrastructure, 1: Scholarship, 2: Emergency
        uint256 startTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
    }

    mapping(address => uint256) public stakedBalances;
    mapping(uint256 => Proposal) public proposals;
    // Proposal ID => Citizen => Has Voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event Staked(address indexed citizen, uint256 amount);
    event Unstaked(address indexed citizen, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 fundingRequest, address recipient);
    event Voted(uint256 indexed proposalId, address indexed citizen, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, uint256 fundedAmount);

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
    }

    modifier onlyVerifiedCitizen() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Only verified citizens can call this function");
        _;
    }

    function stake(uint256 amount) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        require(amount > 0, "Cannot stake 0");
        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        stakedBalances[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        stakedBalances[msg.sender] -= amount;
        bayaniToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function getVotingPower(address citizen) public view returns (uint256) {
        if (!quantumIdentity.isCitizenVerified(citizen)) {
            return 0;
        }
        
        // Democratic Base Power = 100 units for citizenship (SBT check)
        uint256 basePower = 100;

        // Plus Staking Booster: 1 unit per 10 BAYANI staked, capped at +100 units (prevents plutocracy capture)
        uint256 stakeBooster = stakedBalances[citizen] / 10 * 10**18;
        if (stakeBooster > 100) {
            stakeBooster = 100;
        }

        return basePower + stakeBooster;
    }

    function createProposal(
        string calldata description,
        uint256 fundingRequest,
        address recipient,
        uint8 proposalType
    ) external onlyVerifiedCitizen whenNotPaused returns (uint256) {
        require(fundingRequest <= bayaniToken.balanceOf(address(this)), "Not enough treasury funds to back proposal");
        require(recipient != address(0), "Invalid recipient");
        require(proposalType <= 2, "Invalid type");

        proposalCounter++;
        uint256 proposalId = proposalCounter;

        proposals[proposalId] = Proposal({
            id: proposalId,
            description: description,
            fundingRequest: fundingRequest,
            recipient: recipient,
            proposalType: proposalType,
            startTime: block.timestamp,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            cancelled: false
        });

        emit ProposalCreated(proposalId, description, fundingRequest, recipient);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        Proposal storage prop = proposals[proposalId];
        require(prop.startTime > 0, "Proposal does not exist");
        require(block.timestamp < prop.startTime + PROPOSAL_VOTING_PERIOD, "Voting ended");
        require(!prop.executed && !prop.cancelled, "Proposal completed or cancelled");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = getVotingPower(msg.sender);
        require(weight > 0, "No voting weight");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            prop.forVotes += weight;
        } else {
            prop.againstVotes += weight;
        }

        // Claim participation reward from Treasury (Validators category)
        rewardsTreasury.claimRewards(msg.sender, VOTE_REWARD, INationalRewardsTreasury.AllocationCategory.Validators);

        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external nonReentrant whenNotPaused {
        Proposal storage prop = proposals[proposalId];
        require(prop.startTime > 0, "Proposal does not exist");
        require(block.timestamp >= prop.startTime + PROPOSAL_VOTING_PERIOD, "Voting period still active");
        require(!prop.executed, "Already executed");
        require(!prop.cancelled, "Proposal cancelled");
        require(prop.forVotes > prop.againstVotes, "Proposal did not pass");
        require(prop.fundingRequest <= bayaniToken.balanceOf(address(this)), "Insufficient treasury balance");

        prop.executed = true;

        // Disburse funds to recipient
        bayaniToken.safeTransfer(prop.recipient, prop.fundingRequest);

        emit ProposalExecuted(proposalId, prop.fundingRequest);
    }

    function cancelProposal(uint256 proposalId) external onlyRole(GOVERNOR_ROLE) {
        Proposal storage prop = proposals[proposalId];
        require(!prop.executed, "Already executed");
        prop.cancelled = true;
    }

    // Accept general donations or fee splits
    receive() external payable {
        // Can accept ether, but we work in BAYANI
    }
}
