// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";

contract NationalAssetTokenization is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    IERC20 public immutable bayaniToken;

    uint256 public assetCounter;

    struct Asset {
        uint256 id;
        string name;
        string location;
        uint256 valuation;
        uint256 totalSupplyShares;
        uint256 availableShares;
        uint256 pricePerShare; // in BAYANI
        bool isActive;
    }

    mapping(uint256 => Asset) public assets;
    // Asset ID => Shareholder => Shares Owned
    mapping(uint256 => mapping(address => uint256)) public shareholderBalances;
    // Asset ID => Shareholders List
    mapping(uint256 => address[]) public assetShareholders;
    // Tracks if address is in shareholders list to avoid duplicates
    mapping(uint256 => mapping(address => bool)) private _isShareholderListed;
    
    // Non-dividend service utility points balance: Asset ID => Shareholder => Points
    mapping(uint256 => mapping(address => uint256)) public utilityDiscounts;

    event AssetRegistered(uint256 indexed assetId, string name, uint256 valuation, uint256 pricePerShare);
    event SharesPurchased(uint256 indexed assetId, address indexed buyer, uint256 sharesCount, uint256 totalCost);
    event UtilityYieldDistributed(uint256 indexed assetId, uint256 discountPointsPerShare);
    event UtilityDiscountClaimed(uint256 indexed assetId, address indexed shareholder, uint256 amount);

    constructor(
        address _quantumIdentity,
        address _bayaniToken
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        bayaniToken = IERC20(_bayaniToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Buyer is not verified in identity");
        _;
    }

    function registerAsset(
        string calldata name,
        string calldata location,
        uint256 valuation,
        uint256 totalSupplyShares,
        uint256 pricePerShare
    ) external onlyRole(GOVERNOR_ROLE) returns (uint256) {
        require(valuation > 0, "Valuation must be > 0");
        require(totalSupplyShares > 0, "Shares must be > 0");
        require(pricePerShare > 0, "Price per share must be > 0");

        assetCounter++;
        uint256 assetId = assetCounter;

        assets[assetId] = Asset({
            id: assetId,
            name: name,
            location: location,
            valuation: valuation,
            totalSupplyShares: totalSupplyShares,
            availableShares: totalSupplyShares,
            pricePerShare: pricePerShare,
            isActive: true
        });

        emit AssetRegistered(assetId, name, valuation, pricePerShare);
        return assetId;
    }

    function purchaseShares(
        uint256 assetId,
        uint256 sharesCount
    ) external onlyVerifiedCitizen whenNotPaused nonReentrant {
        Asset storage asset = assets[assetId];
        require(asset.isActive, "Asset not active");
        require(sharesCount > 0, "Must buy at least 1 share");
        require(asset.availableShares >= sharesCount, "Not enough available shares");

        uint256 totalCost = sharesCount * asset.pricePerShare;

        // Escrow/Transfer payment to treasury
        bayaniToken.safeTransferFrom(msg.sender, address(this), totalCost);

        asset.availableShares -= sharesCount;
        shareholderBalances[assetId][msg.sender] += sharesCount;

        if (!_isShareholderListed[assetId][msg.sender]) {
            assetShareholders[assetId].push(msg.sender);
            _isShareholderListed[assetId][msg.sender] = true;
        }

        emit SharesPurchased(assetId, msg.sender, sharesCount, totalCost);
    }

    // Distribute service utility discounts (no dividend payments) to satisfy SEC perimeter rules
    function distributeUtilityYield(
        uint256 assetId,
        uint256 discountPointsPerShare
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        Asset memory asset = assets[assetId];
        require(asset.isActive, "Asset not active");
        
        address[] memory shareholders = assetShareholders[assetId];
        for (uint256 i = 0; i < shareholders.length; i++) {
            address shareholder = shareholders[i];
            uint256 balance = shareholderBalances[assetId][shareholder];
            if (balance > 0) {
                uint256 yieldAmount = balance * discountPointsPerShare;
                utilityDiscounts[assetId][shareholder] += yieldAmount;
            }
        }

        emit UtilityYieldDistributed(assetId, discountPointsPerShare);
    }

    // Redundant security safety: Burn utility points to claim service discount certificates
    function claimUtilityServiceDiscount(
        uint256 assetId,
        uint256 amount
    ) external onlyVerifiedCitizen whenNotPaused {
        require(utilityDiscounts[assetId][msg.sender] >= amount, "Insufficient utility discount balance");
        
        utilityDiscounts[assetId][msg.sender] -= amount;

        // In practice, this logs a claim certificate off-chain for the service operator (e.g. Free storage, cheap power)
        emit UtilityDiscountClaimed(assetId, msg.sender, amount);
    }

    function withdrawAssetFunding(address recipient, uint256 amount) external onlyRole(GOVERNOR_ROLE) {
        bayaniToken.safeTransfer(recipient, amount);
    }

    function setAssetStatus(uint256 assetId, bool active) external onlyRole(GOVERNOR_ROLE) {
        assets[assetId].isActive = active;
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
