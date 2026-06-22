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
import "../mock/BayaniNFT.sol";

contract FarmerProsperity is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant CLIMATE_ORACLE_ROLE = keccak256("CLIMATE_ORACLE_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IAIReputationOracle public immutable reputationOracle;
    IERC20 public immutable bayaniToken;
    BayaniNFT public immutable cropNft;

    uint256 public constant BASE_HARVEST_REWARD = 10 * 10**18; // 10 BAYANI
    uint256 public nftCounter;
    uint256 public listingCounter;

    struct Harvest {
        string cropType;
        uint256 volume;
        bool isOrganic;
        bool isClimateFriendly;
        uint256 harvestTime;
        address farmer;
    }

    struct FutureHarvestListing {
        address payable seller;
        uint256 cropNftId;
        uint256 price;
        uint256 deliveryDeadline;
        address buyer;
        bool isSold;
        bool isDelivered;
        bool isCancelled;
    }

    mapping(uint256 => Harvest) public harvests;
    mapping(uint256 => FutureHarvestListing) public listings;
    
    // Insurance pools: Crop NFT => premium amount deposited
    mapping(uint256 => uint256) public insurancePremiums;
    mapping(uint256 => bool) public insuranceClaimed;

    event HarvestRegistered(uint256 indexed nftId, address indexed farmer, string cropType, uint256 rewardAmount);
    event FutureHarvestListed(uint256 indexed listingId, address indexed seller, uint256 cropNftId, uint256 price);
    event FutureHarvestSold(uint256 indexed listingId, address indexed buyer);
    event FutureHarvestDelivered(uint256 indexed listingId, bool isDirectToConsumer, bool isExport, uint256 bonusReward);
    event FutureHarvestCancelled(uint256 indexed listingId, address indexed seller);
    event FutureHarvestRefunded(uint256 indexed listingId, address indexed buyer, uint256 refundAmount);
    event InsurancePaid(uint256 indexed nftId, address indexed farmer, uint256 premium);
    event InsuranceClaimTriggered(uint256 indexed nftId, address indexed farmer, uint256 payout);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _reputationOracle,
        address _bayaniToken,
        address _cropNft
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        reputationOracle = IAIReputationOracle(_reputationOracle);
        bayaniToken = IERC20(_bayaniToken);
        cropNft = BayaniNFT(_cropNft);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(CLIMATE_ORACLE_ROLE, msg.sender);
    }

    modifier onlyVerifiedFarmer() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Citizen not verified");
        require(quantumIdentity.getCitizenType(msg.sender) == 1, "User is not a registered Farmer");
        _;
    }

    function registerHarvest(
        string calldata cropType,
        uint256 volume,
        bool isOrganic,
        bool isClimateFriendly,
        bool isWaterConserving
    ) external onlyVerifiedFarmer whenNotPaused nonReentrant returns (uint256) {
        nftCounter++;
        uint256 nftId = nftCounter;

        harvests[nftId] = Harvest({
            cropType: cropType,
            volume: volume,
            isOrganic: isOrganic,
            isClimateFriendly: isClimateFriendly,
            harvestTime: block.timestamp,
            farmer: msg.sender
        });

        // Mint dynamic crop certificate NFT representing ownership of harvest
        cropNft.mint(msg.sender, nftId, 1, "");

        // Calculate rewards
        uint256 rewardAmount = BASE_HARVEST_REWARD;
        if (isOrganic) {
            rewardAmount *= 2; // Organic Produce = 2x Rewards
        }
        if (isClimateFriendly) {
            rewardAmount += (BASE_HARVEST_REWARD / 2); // 50% bonus
        }
        if (isWaterConserving) {
            rewardAmount += (BASE_HARVEST_REWARD / 2); // 50% bonus
        }

        // Trigger treasury claim
        rewardsTreasury.claimRewards(msg.sender, rewardAmount, INationalRewardsTreasury.AllocationCategory.Farmers);

        emit HarvestRegistered(nftId, msg.sender, cropType, rewardAmount);
        return nftId;
    }

    function listFutureHarvest(
        uint256 cropNftId,
        uint256 price,
        uint256 deliveryDeadline
    ) external onlyVerifiedFarmer whenNotPaused nonReentrant {
        require(cropNft.balanceOf(msg.sender, cropNftId) == 1, "Must own Crop NFT to list");
        require(deliveryDeadline > block.timestamp, "Invalid deadline");

        listingCounter++;
        listings[listingCounter] = FutureHarvestListing({
            seller: payable(msg.sender),
            cropNftId: cropNftId,
            price: price,
            deliveryDeadline: deliveryDeadline,
            buyer: address(0),
            isSold: false,
            isDelivered: false,
            isCancelled: false
        });

        // Lock Crop NFT in listing escrow within this contract to protect buyers
        cropNft.safeTransferFrom(msg.sender, address(this), cropNftId, 1, "");

        emit FutureHarvestListed(listingCounter, msg.sender, cropNftId, price);
    }

    function buyFutureHarvest(uint256 listingId) external whenNotPaused nonReentrant {
        FutureHarvestListing storage listing = listings[listingId];
        require(!listing.isSold, "Already sold");
        require(!listing.isCancelled, "Cancelled");
        require(listing.deliveryDeadline > block.timestamp, "Deadline expired");

        listing.buyer = msg.sender;
        listing.isSold = true;

        // Escrow funds into contract
        bayaniToken.safeTransferFrom(msg.sender, address(this), listing.price);

        emit FutureHarvestSold(listingId, msg.sender);
    }

    function confirmFutureHarvestDelivery(
        uint256 listingId,
        bool isDirectToConsumer,
        bool isExport
    ) external whenNotPaused nonReentrant {
        FutureHarvestListing storage listing = listings[listingId];
        require(listing.isSold, "Not sold yet");
        require(!listing.isDelivered, "Already delivered");
        require(msg.sender == listing.buyer || msg.sender == listing.seller, "Only buyer or seller can complete");

        listing.isDelivered = true;

        // Release crop certificate transfer to buyer from contract escrow
        cropNft.safeTransferFrom(address(this), listing.buyer, listing.cropNftId, 1, "");

        // Transfer escrowed payment to farmer
        bayaniToken.safeTransfer(listing.seller, listing.price);

        // Direct-to-Consumer / Export reward logic
        uint256 bonusReward = 0;
        if (isExport) {
            bonusReward = BASE_HARVEST_REWARD * 5; // Export = 5x Rewards
        } else if (isDirectToConsumer) {
            bonusReward = BASE_HARVEST_REWARD * 3; // Direct-to-Consumer = 3x Rewards
        }

        if (bonusReward > 0) {
            rewardsTreasury.claimRewards(listing.seller, bonusReward, INationalRewardsTreasury.AllocationCategory.Farmers);
        }

        // Reputation score boost
        uint8 currentRep = reputationOracle.getReputationScore(listing.seller);
        if (currentRep < 100) {
            uint8 newRep = currentRep + 5 > 100 ? 100 : currentRep + 5;
            reputationOracle.setReputationScore(listing.seller, newRep);
        }

        emit FutureHarvestDelivered(listingId, isDirectToConsumer, isExport, bonusReward);
    }

    function cancelFutureHarvestListing(uint256 listingId) external whenNotPaused nonReentrant {
        FutureHarvestListing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Only seller can cancel");
        require(!listing.isSold, "Already sold");
        require(!listing.isCancelled, "Already cancelled");

        listing.isCancelled = true;

        // Return Crop NFT from contract escrow back to farmer
        cropNft.safeTransferFrom(address(this), listing.seller, listing.cropNftId, 1, "");

        emit FutureHarvestCancelled(listingId, msg.sender);
    }

    function refundFutureHarvest(uint256 listingId) external whenNotPaused nonReentrant {
        FutureHarvestListing storage listing = listings[listingId];
        require(msg.sender == listing.buyer, "Only buyer can request refund");
        require(listing.isSold, "Not sold");
        require(!listing.isDelivered, "Already delivered");
        require(!listing.isCancelled, "Already cancelled");
        require(block.timestamp > listing.deliveryDeadline, "Delivery deadline has not passed");

        listing.isCancelled = true;

        // Return Crop NFT from contract escrow back to farmer
        cropNft.safeTransferFrom(address(this), listing.seller, listing.cropNftId, 1, "");

        // Refund escrowed payment back to buyer
        bayaniToken.safeTransfer(listing.buyer, listing.price);

        emit FutureHarvestRefunded(listingId, listing.buyer, listing.price);
    }

    function payInsurancePremium(uint256 cropNftId, uint256 premiumAmount) external onlyVerifiedFarmer whenNotPaused nonReentrant {
        require(cropNft.balanceOf(msg.sender, cropNftId) == 1, "Must own crop NFT");
        require(!insuranceClaimed[cropNftId], "Already claimed");

        bayaniToken.safeTransferFrom(msg.sender, address(this), premiumAmount);
        insurancePremiums[cropNftId] += premiumAmount;

        emit InsurancePaid(cropNftId, msg.sender, premiumAmount);
    }

    function triggerInsuranceClaim(
        uint256 cropNftId,
        address farmer,
        uint256 payoutAmount
    ) external onlyRole(CLIMATE_ORACLE_ROLE) nonReentrant {
        require(insurancePremiums[cropNftId] > 0, "No premium paid");
        require(!insuranceClaimed[cropNftId], "Already claimed");
        require(harvests[cropNftId].farmer == farmer, "Invalid farmer match");

        insuranceClaimed[cropNftId] = true;
        
        // Payout is limited to 10x premium paid or treasury emergency reserve
        uint256 maxPayout = insurancePremiums[cropNftId] * 10;
        uint256 finalPayout = payoutAmount > maxPayout ? maxPayout : payoutAmount;

        bayaniToken.safeTransfer(farmer, finalPayout);
        emit InsuranceClaimTriggered(cropNftId, farmer, finalPayout);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }

    // Required for ERC-1155 receiver support if holding NFTs (though we transfer directly)
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}
