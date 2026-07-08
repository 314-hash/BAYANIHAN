// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IQuantumIdentity.sol";
import "../interfaces/INationalRewardsTreasury.sol";

contract RenewableEnergy is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    bytes32 public constant METER_ORACLE_ROLE = keccak256("METER_ORACLE_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    IQuantumIdentity public immutable quantumIdentity;
    INationalRewardsTreasury public immutable rewardsTreasury;
    IERC20 public immutable bayaniToken;

    // 1 kWh = 0.1 BAYANI reward
    uint256 public constant REWARD_PER_KWH = 1 * 10**17; 

    // Internal credit tracking
    mapping(address => uint256) public energyCredits;
    mapping(address => uint256) public carbonCredits;
    mapping(string => uint256) public deviceLastLoggedTimestamp;

    // Community energy pool balances: Pool Name => Address => Balance
    mapping(string => mapping(address => uint256)) public poolBalances;
    mapping(string => uint256) public poolTotalDeposits;

    event EnergyLogged(address indexed producer, string deviceId, uint256 kwhGenerated, uint256 rewardAmount);
    event EnergyCreditTraded(address indexed from, address indexed to, uint256 amount);
    event EnergyPoolDeposited(string poolName, address indexed depositor, uint256 amount);
    event EnergyPoolWithdrawn(string poolName, address indexed depositor, uint256 amount);

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
        _grantRole(METER_ORACLE_ROLE, msg.sender);
    }

    modifier onlyVerifiedCitizen(address citizen) {
        require(quantumIdentity.isCitizenVerified(citizen), "Citizen not verified");
        _;
    }

    // Smart meter logging via ECDSA signed message
    function logGeneration(
        address producer,
        uint256 kwhGenerated,
        string calldata deviceId,
        uint256 timestamp,
        bytes calldata signature
    ) external onlyVerifiedCitizen(producer) whenNotPaused nonReentrant {
        require(kwhGenerated > 0, "No energy generated");
        require(timestamp > deviceLastLoggedTimestamp[deviceId], "Old telemetry data");
        require(timestamp <= block.timestamp + 10 minutes, "Future timestamp not allowed");

        // Verify oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(producer, kwhGenerated, deviceId, timestamp, address(this)));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);

        require(hasRole(METER_ORACLE_ROLE, signer), "Invalid signature: Not signed by authorized meter oracle");

        deviceLastLoggedTimestamp[deviceId] = timestamp;

        // Allocate Energy and Carbon Credits (1 kWh = 1 Energy Credit + 1 Carbon Credit)
        energyCredits[producer] += kwhGenerated;
        carbonCredits[producer] += kwhGenerated; // carbon credits tracking

        // Trigger reward claim (Cooperatives category because energy tracking models micro-cooperatives)
        uint256 rewardAmount = kwhGenerated * REWARD_PER_KWH;
        rewardsTreasury.claimRewards(producer, rewardAmount, INationalRewardsTreasury.AllocationCategory.EcosystemRewards);

        emit EnergyLogged(producer, deviceId, kwhGenerated, rewardAmount);
    }

    // Trade Energy Credits directly between users
    function tradeEnergyCredits(
        address to,
        uint256 amount
    ) external onlyVerifiedCitizen(msg.sender) onlyVerifiedCitizen(to) whenNotPaused {
        require(energyCredits[msg.sender] >= amount, "Insufficient energy credits");
        
        energyCredits[msg.sender] -= amount;
        energyCredits[to] += amount;

        emit EnergyCreditTraded(msg.sender, to, amount);
    }

    // Community Energy Pool: Lock energy credits for cooperative consumption/distribution
    function depositToPool(
        string calldata poolName,
        uint256 amount
    ) external onlyVerifiedCitizen(msg.sender) whenNotPaused {
        require(energyCredits[msg.sender] >= amount, "Insufficient energy credits");
        
        energyCredits[msg.sender] -= amount;
        poolBalances[poolName][msg.sender] += amount;
        poolTotalDeposits[poolName] += amount;

        emit EnergyPoolDeposited(poolName, msg.sender, amount);
    }

    function withdrawFromPool(
        string calldata poolName,
        uint256 amount
    ) external onlyVerifiedCitizen(msg.sender) whenNotPaused {
        require(poolBalances[poolName][msg.sender] >= amount, "Insufficient pool balance");

        poolBalances[poolName][msg.sender] -= amount;
        poolTotalDeposits[poolName] -= amount;
        energyCredits[msg.sender] += amount;

        emit EnergyPoolWithdrawn(poolName, msg.sender, amount);
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
