// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/IAIReputationOracle.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract MSMEGrowth is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant FEEDBACK_PROVIDER_ROLE = keccak256("FEEDBACK_PROVIDER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant REVENUE_TRACKER_ROLE = keccak256("REVENUE_TRACKER_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IAIReputationOracle public immutable reputationOracle;
    IERC20 public immutable bayaniToken;

    uint256 public constant BASE_MSME_REWARD = 20 * 10**18; // 20 BAYANI

    struct BusinessProfile {
        string businessName;
        uint256 registrationDate;
        uint256 totalRevenue;
        uint256 currentMonthRevenue;
        uint256 lastMonthRevenue;
        uint256 totalReviewsCount;
        uint256 cumulativeReviewsSum; // Out of 5 stars
        uint256 communityContributions;
        uint256 lastRewardEpoch;
    }

    mapping(address => BusinessProfile) public businesses;
    mapping(address => uint8) public merchantTiers; // 0: Standard, 1: Bronze, 2: Silver, 3: Gold, 4: Platinum

    event BusinessRegistered(address indexed merchant, string name);
    event RevenueLogged(address indexed merchant, uint256 amount);
    event ReviewSubmitted(address indexed merchant, uint8 rating);
    event ContributionLogged(address indexed merchant, uint256 points);
    event MerchantRewarded(address indexed merchant, uint256 rewardAmount, uint256 score);
    event TierUpgraded(address indexed merchant, uint8 tier);

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
        _grantRole(FEEDBACK_PROVIDER_ROLE, msg.sender);
        _grantRole(REVENUE_TRACKER_ROLE, msg.sender);
    }

    modifier onlyVerifiedMerchant() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Merchant not verified in identity");
        require(quantumIdentity.getCitizenType(msg.sender) == 3, "User is not a registered MSME");
        _;
    }

    function registerBusiness(string calldata name) external onlyVerifiedMerchant whenNotPaused {
        require(businesses[msg.sender].registrationDate == 0, "Business already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        businesses[msg.sender] = BusinessProfile({
            businessName: name,
            registrationDate: block.timestamp,
            totalRevenue: 0,
            currentMonthRevenue: 0,
            lastMonthRevenue: 0,
            totalReviewsCount: 0,
            cumulativeReviewsSum: 0,
            communityContributions: 0,
            lastRewardEpoch: block.timestamp
        });

        emit BusinessRegistered(msg.sender, name);
    }

    function logRevenue(address merchant, uint256 amount) external onlyRole(REVENUE_TRACKER_ROLE) whenNotPaused {
        BusinessProfile storage profile = businesses[merchant];
        require(profile.registrationDate > 0, "Business not registered");

        profile.totalRevenue += amount;
        profile.currentMonthRevenue += amount;

        emit RevenueLogged(merchant, amount);
    }

    function submitReview(address merchant, uint8 rating) external onlyRole(FEEDBACK_PROVIDER_ROLE) whenNotPaused {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        BusinessProfile storage profile = businesses[merchant];
        require(profile.registrationDate > 0, "Business not registered");

        profile.totalReviewsCount++;
        profile.cumulativeReviewsSum += rating;

        emit ReviewSubmitted(merchant, rating);
    }

    function logCommunityContribution(address merchant, uint256 points) external onlyRole(GOVERNOR_ROLE) whenNotPaused {
        BusinessProfile storage profile = businesses[merchant];
        require(profile.registrationDate > 0, "Business not registered");

        profile.communityContributions += points;
        emit ContributionLogged(merchant, points);
    }

    // Monthly epoch reward update trigger
    function processEpochRewards(address merchant) external nonReentrant whenNotPaused {
        BusinessProfile storage profile = businesses[merchant];
        require(profile.registrationDate > 0, "Business not registered");
        require(block.timestamp >= profile.lastRewardEpoch + 30 days, "Epoch cycle not reached yet");

        // Calculate Revenue Growth percentage
        uint256 growthScore = 0;
        if (profile.lastMonthRevenue > 0) {
            if (profile.currentMonthRevenue > profile.lastMonthRevenue) {
                growthScore = ((profile.currentMonthRevenue - profile.lastMonthRevenue) * 100) / profile.lastMonthRevenue;
            }
        } else if (profile.currentMonthRevenue > 0) {
            growthScore = 50; // default initial growth score if first month revenue occurs
        }

        // Calculate Review average (scaled out of 100)
        uint256 averageReviewScore = 0;
        if (profile.totalReviewsCount > 0) {
            // (sum / count) * 20 = score out of 100
            averageReviewScore = (profile.cumulativeReviewsSum * 20) / profile.totalReviewsCount;
        }

        // Calculate Longevity points (1 point per month registered, max 30)
        uint256 longevityMonths = (block.timestamp - profile.registrationDate) / 30 days;
        uint256 longevityScore = longevityMonths > 30 ? 30 : longevityMonths;

        // Calculate Community contribution score
        uint256 contributionScore = profile.communityContributions > 50 ? 50 : profile.communityContributions;

        // Total reward score formula
        uint256 totalRewardScore = growthScore + averageReviewScore + longevityScore + contributionScore;

        // Claim distribution if score is above threshold (e.g. 50 score)
        uint256 rewardAmount = 0;
        if (totalRewardScore >= 50) {
            rewardAmount = (BASE_MSME_REWARD * totalRewardScore) / 100;
            // Cap max reward at 5x base
            if (rewardAmount > BASE_MSME_REWARD * 5) {
                rewardAmount = BASE_MSME_REWARD * 5;
            }
            rewardsTreasury.claimRewards(merchant, rewardAmount, INationalRewardsTreasury.AllocationCategory.MSMEs);
        }

        // Cycle the revenues
        profile.lastMonthRevenue = profile.currentMonthRevenue;
        profile.currentMonthRevenue = 0;
        profile.lastRewardEpoch = block.timestamp;

        // Sync to Oracle Reputation score
        uint8 mappedReputation = totalRewardScore > 100 ? 100 : uint8(totalRewardScore);
        reputationOracle.setReputationScore(merchant, mappedReputation);

        // Tiering upgrade check
        uint8 newTier = 0;
        if (totalRewardScore >= 150) {
            newTier = 4; // Platinum
        } else if (totalRewardScore >= 100) {
            newTier = 3; // Gold
        } else if (totalRewardScore >= 75) {
            newTier = 2; // Silver
        } else if (totalRewardScore >= 50) {
            newTier = 1; // Bronze
        }

        if (newTier > merchantTiers[merchant]) {
            merchantTiers[merchant] = newTier;
            emit TierUpgraded(merchant, newTier);
        }

        emit MerchantRewarded(merchant, rewardAmount, totalRewardScore);
    }

    // View benefits
    function getMerchantFeeDiscount(address merchant) external view returns (uint256 discountBasisPoints) {
        uint8 tier = merchantTiers[merchant];
        if (tier == 4) return 5000; // 50% discount on marketplace fees
        if (tier == 3) return 3000; // 30% discount
        if (tier == 2) return 1500; // 15% discount
        if (tier == 1) return 500;  // 5% discount
        return 0;
    }

    function getMerchantCreditRating(address merchant) external view returns (uint256 creditRatingScore) {
        // Simple mock representing credit score based on tiers and revenues
        uint8 tier = merchantTiers[merchant];
        return 300 + (uint256(tier) * 125) + (businesses[merchant].totalRevenue / 10000000000000000000000); // base 300 up to 850
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
