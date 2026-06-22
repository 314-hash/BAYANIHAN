// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IQuantumIdentity.sol";

contract QuantumIdentity is IQuantumIdentity, AccessControl, Pausable {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct PQKey {
        string algorithm; // e.g. "CRYSTALS-Dilithium", "Falcon", "SPHINCS+"
        bytes publicKey;
        uint256 updatedTime;
    }

    mapping(address => CitizenProfile) private _profiles;
    mapping(address => PQKey) private _pqKeys;
    
    // Recovery Guardians: Citizen => list of unique guardian addresses
    mapping(address => address[]) private _guardians;
    // Recovery Votes: Citizen => Proposed New Wallet => count of votes
    mapping(address => mapping(address => uint256)) private _recoveryVotes;
    // Track guardian voting status to prevent double voting: Citizen => Proposed New Wallet => Guardian => Voted
    mapping(address => mapping(address => mapping(address => bool))) private _hasVoted;

    event CitizenRegistered(address indexed citizen, uint8 identityType, string nationalIdHash);
    event CitizenVerified(address indexed citizen, uint8 identityType);
    event PQKeyUpdated(address indexed citizen, string algorithm, bytes publicKey);
    event GuardiansUpdated(address indexed citizen, address[] guardians);
    event RecoveryInitiated(address indexed oldCitizen, address indexed newWallet, address indexed guardian);
    event RecoveryExecuted(address indexed oldCitizen, address indexed newWallet);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }

    function registerCitizen(
        string calldata nationalIdHash,
        string calldata biometricHash,
        uint8 identityType,
        address[] calldata initialGuardians
    ) external whenNotPaused {
        require(!_profiles[msg.sender].isVerified, "Already registered");
        require(bytes(nationalIdHash).length > 0, "Empty ID hash");
        require(initialGuardians.length >= 2, "Need at least 2 guardians");

        _profiles[msg.sender] = CitizenProfile({
            nationalIdHash: nationalIdHash,
            biometricHash: biometricHash,
            registrationTime: block.timestamp,
            isVerified: false,
            identityType: identityType
        });

        _guardians[msg.sender] = initialGuardians;

        emit CitizenRegistered(msg.sender, identityType, nationalIdHash);
        emit GuardiansUpdated(msg.sender, initialGuardians);
    }

    function verifyCitizen(address citizen, uint8 identityType) external override onlyRole(VALIDATOR_ROLE) {
        require(_profiles[citizen].registrationTime > 0, "Citizen profile not found");
        _profiles[citizen].isVerified = true;
        _profiles[citizen].identityType = identityType;
        emit CitizenVerified(citizen, identityType);
    }

    function updatePQKey(string calldata algorithm, bytes calldata publicKey) external whenNotPaused {
        require(_profiles[msg.sender].isVerified, "Must be verified citizen");
        _pqKeys[msg.sender] = PQKey({
            algorithm: algorithm,
            publicKey: publicKey,
            updatedTime: block.timestamp
        });
        emit PQKeyUpdated(msg.sender, algorithm, publicKey);
    }

    function initiateRecovery(address oldCitizen, address newWallet) external whenNotPaused {
        address[] memory citizenGuardians = _guardians[oldCitizen];
        bool isGuardian = false;
        for (uint256 i = 0; i < citizenGuardians.length; i++) {
            if (citizenGuardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Caller is not a guardian");
        require(!_hasVoted[oldCitizen][newWallet][msg.sender], "Guardian already voted");

        _hasVoted[oldCitizen][newWallet][msg.sender] = true;
        _recoveryVotes[oldCitizen][newWallet] += 1;

        emit RecoveryInitiated(oldCitizen, newWallet, msg.sender);

        uint256 requiredVotes = (citizenGuardians.length / 2) + 1;
        if (_recoveryVotes[oldCitizen][newWallet] >= requiredVotes) {
            // Transfer profile data
            _profiles[newWallet] = _profiles[oldCitizen];
            _guardians[newWallet] = _guardians[oldCitizen];
            _pqKeys[newWallet] = _pqKeys[oldCitizen];

            // Delete old data
            delete _profiles[oldCitizen];
            delete _guardians[oldCitizen];
            delete _pqKeys[oldCitizen];

            emit RecoveryExecuted(oldCitizen, newWallet);
        }
    }

    // View functions
    function isCitizenVerified(address citizen) external view override returns (bool) {
        return _profiles[citizen].isVerified;
    }

    function getCitizenType(address citizen) external view override returns (uint8) {
        require(_profiles[citizen].isVerified, "Citizen not verified");
        return _profiles[citizen].identityType;
    }

    function getCitizenProfile(address citizen) external view returns (CitizenProfile memory) {
        return _profiles[citizen];
    }

    function getPQKey(address citizen) external view returns (string memory algorithm, bytes memory publicKey, uint256 updatedTime) {
        PQKey memory key = _pqKeys[citizen];
        return (key.algorithm, key.publicKey, key.updatedTime);
    }

    function getGuardians(address citizen) external view returns (address[] memory) {
        return _guardians[citizen];
    }

    function pause() external onlyRole(GOVERNOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNOR_ROLE) {
        _unpause();
    }
}
