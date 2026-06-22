// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../mock/BayaniNFT.sol";

contract BayaniLegacy is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    IERC20 public immutable bayaniToken;
    BayaniNFT public immutable legacyNft;

    // Time definitions representing years (can mock/adjust in tests)
    uint256 public constant FIVE_YEARS = 5 * 365 days;
    uint256 public constant TEN_YEARS = 10 * 365 days;
    uint256 public constant TWENTY_YEARS = 20 * 365 days;
    uint256 public constant FIFTY_YEARS = 50 * 365 days;

    struct TrustVault {
        address owner;
        uint256 balance;
        uint256 lastProofOfLife;
        uint256 inactivityTimeout; // in seconds
        bool active;
        address[] successors;
        uint256[] successorShares; // Basis points (sum must equal 10000)
    }

    mapping(address => TrustVault) public vaults;
    
    // Multi-Generation Family Wallets: Primary Owner => Authorized Family Members
    mapping(address => address[]) public familyMembers;
    // Map family members to primary owner to check access
    mapping(address => address) public memberToPrimaryOwner;

    event TrustVaultCreated(address indexed owner, uint256 timeout);
    event TrustVaultDeposited(address indexed owner, uint256 amount);
    event ProofOfLifeRegistered(address indexed owner);
    event SuccessionExecuted(address indexed owner, address indexed executionInitiator, uint256 totalDistributed);
    event FamilyMemberAdded(address indexed owner, address indexed member);
    event LegacyStatusClaimed(address indexed citizen, uint8 statusTier, uint256 tokenIndex);

    constructor(
        address _quantumIdentity,
        address _bayaniToken,
        address _legacyNft
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        bayaniToken = IERC20(_bayaniToken);
        legacyNft = BayaniNFT(_legacyNft);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Only verified citizens");
        _;
    }

    modifier onlyVaultOwnerOrFamily(address primaryOwner) {
        require(
            msg.sender == primaryOwner || 
            memberToPrimaryOwner[msg.sender] == primaryOwner, 
            "Unauthorized access to trust vault"
        );
        _;
    }

    function createTrustVault(
        address[] calldata successors,
        uint256[] calldata successorShares,
        uint256 inactivityTimeout
    ) external onlyVerifiedCitizen whenNotPaused {
        require(successors.length > 0, "Need at least one successor");
        require(successors.length == successorShares.length, "Lengths mismatch");
        require(inactivityTimeout >= 30 days, "Timeout must be at least 30 days");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < successors.length; i++) {
            require(successors[i] != address(0), "Invalid successor address");
            totalShares += successorShares[i];
        }
        require(totalShares == 10000, "Total shares must equal 100% (10000 bps)");

        vaults[msg.sender] = TrustVault({
            owner: msg.sender,
            balance: 0,
            lastProofOfLife: block.timestamp,
            inactivityTimeout: inactivityTimeout,
            active: true,
            successors: successors,
            successorShares: successorShares
        });

        emit TrustVaultCreated(msg.sender, inactivityTimeout);
    }

    function depositToVault(address primaryOwner, uint256 amount) external onlyVaultOwnerOrFamily(primaryOwner) whenNotPaused nonReentrant {
        TrustVault storage vault = vaults[primaryOwner];
        require(vault.active, "Vault not active");
        require(amount > 0, "Amount must be > 0");

        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        vault.balance += amount;
        vault.lastProofOfLife = block.timestamp; // deposit counts as proof of life

        emit TrustVaultDeposited(primaryOwner, amount);
    }

    function registerProofOfLife() external onlyVerifiedCitizen {
        TrustVault storage vault = vaults[msg.sender];
        require(vault.active, "Vault not active");

        vault.lastProofOfLife = block.timestamp;
        emit ProofOfLifeRegistered(msg.sender);
    }

    function addFamilyMember(address member) external onlyVerifiedCitizen {
        require(member != address(0), "Invalid member address");
        require(memberToPrimaryOwner[member] == address(0), "Member already belongs to a family");
        
        familyMembers[msg.sender].push(member);
        memberToPrimaryOwner[member] = msg.sender;

        emit FamilyMemberAdded(msg.sender, member);
    }

    function executeSuccession(address primaryOwner) external nonReentrant whenNotPaused {
        TrustVault storage vault = vaults[primaryOwner];
        require(vault.active, "Vault not active");
        require(vault.balance > 0, "Vault has no assets");
        require(block.timestamp > vault.lastProofOfLife + vault.inactivityTimeout, "Owner timeout not expired");

        uint256 originalBalance = vault.balance;
        vault.balance = 0;
        vault.active = false; // close vault after execution

        // Distribute assets to successors
        for (uint256 i = 0; i < vault.successors.length; i++) {
            uint256 shareAmount = (originalBalance * vault.successorShares[i]) / 10000;
            if (shareAmount > 0) {
                bayaniToken.safeTransfer(vault.successors[i], shareAmount);
            }
        }

        emit SuccessionExecuted(primaryOwner, msg.sender, originalBalance);
    }

    // Longevity Status NFTs claims based on profile age
    function claimLegacyRewards() external onlyVerifiedCitizen whenNotPaused nonReentrant {
        IQuantumIdentity.CitizenProfile memory profile = quantumIdentity.getCitizenProfile(msg.sender);
        uint256 participationDuration = block.timestamp - profile.registrationTime;

        // NFT ids: 2 = Legacy, 3 = Governance Elite, 4 = National Builder, 5 = Bayani Founder
        if (participationDuration >= FIFTY_YEARS) {
            _mintLegacyNFTIfEligible(msg.sender, 5, 4);
        } else if (participationDuration >= TWENTY_YEARS) {
            _mintLegacyNFTIfEligible(msg.sender, 4, 3);
        } else if (participationDuration >= TEN_YEARS) {
            _mintLegacyNFTIfEligible(msg.sender, 3, 2);
        } else if (participationDuration >= FIVE_YEARS) {
            _mintLegacyNFTIfEligible(msg.sender, 2, 1);
        } else {
            revert("Not eligible for any legacy milestones yet");
        }
    }

    // Manual test booster for developers to assign legacy status in local environments
    function devSimulateLegacyReward(address citizen, uint8 statusTier) external onlyRole(GOVERNOR_ROLE) {
        require(statusTier >= 1 && statusTier <= 4, "Invalid status tier");
        uint256 nftId = statusTier + 1; // map tier 1-4 to nft 2-5
        
        legacyNft.mint(citizen, nftId, 1, "");
        emit LegacyStatusClaimed(citizen, statusTier, nftId);
    }

    function _mintLegacyNFTIfEligible(address citizen, uint256 nftId, uint8 tier) internal {
        // Enforce maximum 1 balance of legacy status badge
        if (legacyNft.balanceOf(citizen, nftId) == 0) {
            legacyNft.mint(citizen, nftId, 1, "");
            emit LegacyStatusClaimed(citizen, tier, nftId);
        }
    }

    function getFamilyMembers(address owner) external view returns (address[] memory) {
        return familyMembers[owner];
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
