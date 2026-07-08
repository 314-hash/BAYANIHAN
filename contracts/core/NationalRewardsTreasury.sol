// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract NationalRewardsTreasury is INationalRewardsTreasury, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IERC20 public immutable bayaniToken;

    // Track total tokens received by treasury (balance + historical payouts)
    uint256 public totalHistoricalPool;
    
    // Category mapping to historical claims
    mapping(uint256 => uint256) public categoryClaims;

    // Percentages (scaled to 100)
    mapping(uint256 => uint256) public categoryPercentages;

    event RewardDistributed(address indexed recipient, uint256 amount, AllocationCategory category);
    event FundsReceived(address indexed sender, uint256 amount);
    event ContractAuthorized(address indexed contractAddr, bool status);

    constructor(address _bayaniToken) {
        require(_bayaniToken != address(0), "Invalid token address");
        bayaniToken = IERC20(_bayaniToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);

        // Set allocation percentages
        categoryPercentages[uint256(AllocationCategory.CommunityTreasury)] = 35;
        categoryPercentages[uint256(AllocationCategory.EcosystemRewards)] = 25;
        categoryPercentages[uint256(AllocationCategory.CoreTeam)] = 10;
        categoryPercentages[uint256(AllocationCategory.Founder)] = 5;
        categoryPercentages[uint256(AllocationCategory.Validators)] = 10;
        categoryPercentages[uint256(AllocationCategory.Liquidity)] = 5;
        categoryPercentages[uint256(AllocationCategory.Marketing)] = 5;
        categoryPercentages[uint256(AllocationCategory.Reserve)] = 3;
        categoryPercentages[uint256(AllocationCategory.Advisors)] = 2;
    }

    // Accept fund transfers and record them
    function depositFunds(uint256 amount) external nonReentrant whenNotPaused {
        bayaniToken.safeTransferFrom(msg.sender, address(this), amount);
        totalHistoricalPool += amount;
        emit FundsReceived(msg.sender, amount);
    }

    // Role-restricted claim method
    function claimRewards(
        address recipient,
        uint256 amount,
        AllocationCategory category
    ) external override onlyRole(DISTRIBUTOR_ROLE) nonReentrant whenNotPaused {
        require(recipient != address(0), "Recipient is zero address");
        uint256 catIndex = uint256(category);
        
        // Enforce percentage caps
        uint256 maxAllowed = (totalHistoricalPool * categoryPercentages[catIndex]) / 100;
        require(categoryClaims[catIndex] + amount <= maxAllowed, "Exceeds category budget allocation");

        categoryClaims[catIndex] += amount;
        
        // Transfer to recipient
        bayaniToken.safeTransfer(recipient, amount);

        emit RewardDistributed(recipient, amount, category);
    }

    function addAuthorizedContract(address contractAddr) external override onlyRole(GOVERNOR_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, contractAddr);
        emit ContractAuthorized(contractAddr, true);
    }

    function removeAuthorizedContract(address contractAddr) external onlyRole(GOVERNOR_ROLE) {
        _revokeRole(DISTRIBUTOR_ROLE, contractAddr);
        emit ContractAuthorized(contractAddr, false);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    // Fallback emergency withdraw in case tokens are stuck (only for Governors)
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(GOVERNOR_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
