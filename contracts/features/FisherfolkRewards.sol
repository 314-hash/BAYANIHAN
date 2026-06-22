// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";
import "../mock/BayaniNFT.sol";

contract FisherfolkRewards is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MARINE_OFFICER_ROLE = keccak256("MARINE_OFFICER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    BayaniNFT public immutable catchNft;

    uint256 public constant BASE_CATCH_REWARD = 5 * 10**18; // 5 BAYANI
    uint256 public catchCounter;

    struct CatchRecord {
        string species;
        uint256 weight;
        string geolocationHash;
        uint256 timestamp;
        address fisher;
        bool isExportQuality;
        bool isProtectedCompliant;
        bool isVerified;
    }

    struct ImpactScore {
        uint8 sustainability; // 0-100
        uint8 productQuality; // 0-100
        uint8 communityParticipation; // 0-100
    }

    mapping(uint256 => CatchRecord) public catches;
    mapping(address => ImpactScore) public fisherImpactScores;
    mapping(address => uint256) public totalConservationParticipations;

    event CatchLogged(uint256 indexed catchId, address indexed fisher, string species, uint256 weight);
    event CatchVerified(uint256 indexed catchId, address indexed verifier, uint256 rewardAmount);
    event ConservationActivityLogged(address indexed fisher, string activityType, uint256 rewardAmount);
    event ImpactScoreUpdated(address indexed fisher, uint8 sustainability, uint8 quality, uint8 community);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _catchNft
    ) {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        catchNft = BayaniNFT(_catchNft);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(MARINE_OFFICER_ROLE, msg.sender);
    }

    modifier onlyVerifiedFisher() {
        require(quantumIdentity.isCitizenVerified(msg.sender), "Citizen not verified");
        require(quantumIdentity.getCitizenType(msg.sender) == 2, "User is not a registered Fisherfolk");
        _;
    }

    function logCatch(
        string calldata species,
        uint256 weight,
        string calldata geolocationHash,
        bool isExportQuality
    ) external onlyVerifiedFisher whenNotPaused returns (uint256) {
        catchCounter++;
        uint256 catchId = catchCounter;

        catches[catchId] = CatchRecord({
            species: species,
            weight: weight,
            geolocationHash: geolocationHash,
            timestamp: block.timestamp,
            fisher: msg.sender,
            isExportQuality: isExportQuality,
            isProtectedCompliant: false,
            isVerified: false
        });

        emit CatchLogged(catchId, msg.sender, species, weight);
        return catchId;
    }

    function verifyCatch(
        uint256 catchId,
        bool isProtectedCompliant,
        uint8 sustainabilityScore,
        uint8 qualityScore
    ) external onlyRole(MARINE_OFFICER_ROLE) whenNotPaused nonReentrant {
        CatchRecord storage record = catches[catchId];
        require(record.timestamp > 0, "Catch record does not exist");
        require(!record.isVerified, "Already verified");
        require(sustainabilityScore <= 100 && qualityScore <= 100, "Scores must be <= 100");

        record.isVerified = true;
        record.isProtectedCompliant = isProtectedCompliant;

        // Mint trace token NFT representing certified catch ownership
        catchNft.mint(record.fisher, catchId, 1, "");

        // Calculate rewards
        uint256 rewards = BASE_CATCH_REWARD;
        if (record.isExportQuality) {
            rewards += BASE_CATCH_REWARD * 2; // Premium Export Quality = Bonus (adds 2x base)
        }
        if (isProtectedCompliant) {
            rewards += (BASE_CATCH_REWARD / 2); // Protected Species Compliance = Bonus (adds 0.5x base)
        }

        // Trigger rewards distribution from treasury
        rewardsTreasury.claimRewards(record.fisher, rewards, INationalRewardsTreasury.AllocationCategory.Farmers);

        // Update Impact Score
        address fisher = record.fisher;
        ImpactScore storage score = fisherImpactScores[fisher];
        score.sustainability = uint8((uint256(score.sustainability) * 9 + sustainabilityScore) / 10);
        score.productQuality = uint8((uint256(score.productQuality) * 9 + qualityScore) / 10);
        
        emit CatchVerified(catchId, msg.sender, rewards);
        emit ImpactScoreUpdated(fisher, score.sustainability, score.productQuality, score.communityParticipation);
    }

    function logConservationActivity(
        address fisher,
        string calldata activityType,
        uint8 communityParticipationIncrement
    ) external onlyRole(MARINE_OFFICER_ROLE) whenNotPaused nonReentrant {
        require(quantumIdentity.isCitizenVerified(fisher), "Fisher not verified");
        require(quantumIdentity.getCitizenType(fisher) == 2, "User is not registered Fisherfolk");
        require(communityParticipationIncrement <= 50, "Increment too high");

        totalConservationParticipations[fisher]++;
        
        // Base conservation participation bonus
        uint256 reward = BASE_CATCH_REWARD * 3; // Conservation Participation = Bonus (3x base)
        rewardsTreasury.claimRewards(fisher, reward, INationalRewardsTreasury.AllocationCategory.Farmers);

        // Update community participation score
        ImpactScore storage score = fisherImpactScores[fisher];
        uint16 newPart = uint16(score.communityParticipation) + communityParticipationIncrement;
        score.communityParticipation = newPart > 100 ? 100 : uint8(newPart);

        emit ConservationActivityLogged(fisher, activityType, reward);
        emit ImpactScoreUpdated(fisher, score.sustainability, score.productQuality, score.communityParticipation);
    }

    function getImpactScore(address fisher) external view returns (uint8 sustainability, uint8 productQuality, uint8 communityParticipation) {
        ImpactScore memory score = fisherImpactScores[fisher];
        return (score.sustainability, score.productQuality, score.communityParticipation);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
