// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IAIReputationOracle.sol";

contract AIReputationOracle is IAIReputationOracle, AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    mapping(address => uint8) private _scores;
    mapping(address => uint256) private _nonces;

    event ReputationUpdated(address indexed user, uint8 score, address oracle);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    function getReputationScore(address user) external view override returns (uint8) {
        return _scores[user];
    }

    function setReputationScore(address user, uint8 score) external override onlyRole(ORACLE_ROLE) {
        require(score <= 100, "Score must be <= 100");
        _scores[user] = score;
        emit ReputationUpdated(user, score, msg.sender);
    }

    function setReputationScoreWithSignature(
        address user,
        uint8 score,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(score <= 100, "Score must be <= 100");
        require(nonce == _nonces[user], "Invalid nonce");
        _nonces[user]++;

        bytes32 messageHash = keccak256(abi.encodePacked(user, score, nonce, address(this)));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);

        require(hasRole(ORACLE_ROLE, signer), "Invalid signature: Signer is not an oracle");

        _scores[user] = score;
        emit ReputationUpdated(user, score, signer);
    }

    function getUserNonce(address user) external view returns (uint256) {
        return _nonces[user];
    }
}
