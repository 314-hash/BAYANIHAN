// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract EducationRewards is ERC721, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant EDUCATOR_ROLE = keccak256("EDUCATOR_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;

    uint256 public constant COURSE_COMPLETION_REWARD = 2 * 10**18; // 2 BAYANI
    uint256 public constant ASSESSMENT_PASS_REWARD = 3 * 10**18;  // 3 BAYANI
    uint256 public constant TEACHING_REWARD = 10 * 10**18;         // 10 BAYANI
    uint256 public constant MENTOR_REWARD = 5 * 10**18;           // 5 BAYANI

    uint256 public tokenIdCounter;
    uint256 public scholarshipPoolBalance;

    // Student records
    mapping(address => uint256) public completedCoursesCount;
    mapping(address => uint256) public passedAssessmentsCount;
    mapping(address => uint8) public scholarLevel; // 0: None, 1: Bronze, 2: Silver, 3: Gold, 4: National

    // Scholarship student allocations: Student => Allocated amount
    mapping(address => uint256) public scholarshipAllocations;
    mapping(address => uint256) public scholarshipClaimed;

    event CourseCompleted(address indexed student, string courseId, uint256 rewardAmount);
    event AssessmentPassed(address indexed student, string assessmentId, uint256 rewardAmount);
    event ClassTaught(address indexed teacher, string courseId, uint256 rewardAmount);
    event MentorshipLogged(address indexed mentor, address indexed mentee, uint256 rewardAmount);
    
    event ScholarLevelUpgraded(address indexed student, uint8 newLevel);
    event ScholarshipFunded(address indexed donor, uint256 amount);
    event ScholarshipAllocated(address indexed student, uint256 amount);
    event ScholarshipClaimed(address indexed student, uint256 amount);

    constructor(
        address _quantumIdentity,
        address _rewardsTreasury,
        address _bayaniToken
    ) ERC721("Bayani Skill NFT", "BSKILL") {
        quantumIdentity = IQuantumIdentity(_quantumIdentity);
        rewardsTreasury = INationalRewardsTreasury(_rewardsTreasury);
        bayaniToken = IERC20(_bayaniToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(EDUCATOR_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen(address user) {
        require(quantumIdentity.isCitizenVerified(user), "User not verified citizen");
        _;
    }

    // Override transfers to make this token Soulbound (ERC-5192 functionality)
    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: Transfers not allowed");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: Transfers not allowed");
    }

    // Educator action triggers
    function registerCourseCompletion(
        address student,
        string calldata courseId
    ) external onlyRole(EDUCATOR_ROLE) onlyVerifiedCitizen(student) whenNotPaused nonReentrant {
        completedCoursesCount[student]++;
        
        // Mint Skill NFT for course completion
        tokenIdCounter++;
        _mint(student, tokenIdCounter);

        // Claim completion reward
        rewardsTreasury.claimRewards(student, COURSE_COMPLETION_REWARD, INationalRewardsTreasury.AllocationCategory.Education);

        emit CourseCompleted(student, courseId, COURSE_COMPLETION_REWARD);

        // Check level up
        _checkAndUpgradeScholarLevel(student);
    }

    function registerAssessmentPass(
        address student,
        string calldata assessmentId
    ) external onlyRole(EDUCATOR_ROLE) onlyVerifiedCitizen(student) whenNotPaused nonReentrant {
        passedAssessmentsCount[student]++;
        
        rewardsTreasury.claimRewards(student, ASSESSMENT_PASS_REWARD, INationalRewardsTreasury.AllocationCategory.Education);
        emit AssessmentPassed(student, assessmentId, ASSESSMENT_PASS_REWARD);
    }

    function registerTeachingSession(
        address teacher,
        string calldata courseId
    ) external onlyRole(EDUCATOR_ROLE) onlyVerifiedCitizen(teacher) whenNotPaused nonReentrant {
        rewardsTreasury.claimRewards(teacher, TEACHING_REWARD, INationalRewardsTreasury.AllocationCategory.Education);
        emit ClassTaught(teacher, courseId, TEACHING_REWARD);
    }

    function registerMentorship(
        address mentor,
        address mentee
    ) external onlyRole(EDUCATOR_ROLE) onlyVerifiedCitizen(mentor) onlyVerifiedCitizen(mentee) whenNotPaused nonReentrant {
        rewardsTreasury.claimRewards(mentor, MENTOR_REWARD, INationalRewardsTreasury.AllocationCategory.Education);
        emit MentorshipLogged(mentor, mentee, MENTOR_REWARD);
    }

    // Scholarship features
    function fundScholarship(uint256 amount) external whenNotPaused nonReentrant {
        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        scholarshipPoolBalance += amount;
        emit ScholarshipFunded(msg.sender, amount);
    }

    function allocateScholarship(address student, uint256 amount) external onlyRole(GOVERNOR_ROLE) {
        require(amount <= scholarshipPoolBalance, "Insufficient scholarship pool balance");
        scholarshipPoolBalance -= amount;
        scholarshipAllocations[student] += amount;
        emit ScholarshipAllocated(student, amount);
    }

    function claimScholarshipStipend() external onlyVerifiedCitizen(msg.sender) whenNotPaused nonReentrant {
        uint256 allocated = scholarshipAllocations[msg.sender];
        uint256 claimed = scholarshipClaimed[msg.sender];
        require(allocated > claimed, "No unclaimed allocation");

        uint256 payout = allocated - claimed;
        scholarshipClaimed[msg.sender] = allocated;
        
        bayaniToken.safeTransfer(msg.sender, payout);
        emit ScholarshipClaimed(msg.sender, payout);
    }

    function _checkAndUpgradeScholarLevel(address student) internal {
        uint256 courses = completedCoursesCount[student];
        uint8 currentLvl = scholarLevel[student];
        uint8 newLvl = currentLvl;

        if (courses >= 500) {
            newLvl = 4; // National Scholar
        } else if (courses >= 100) {
            newLvl = 3; // Gold Scholar
        } else if (courses >= 50) {
            newLvl = 2; // Silver Scholar
        } else if (courses >= 10) {
            newLvl = 1; // Bronze Scholar
        }

        if (newLvl > currentLvl) {
            scholarLevel[student] = newLvl;
            emit ScholarLevelUpgraded(student, newLvl);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
