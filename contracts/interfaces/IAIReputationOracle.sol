// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAIReputationOracle {
    function getReputationScore(address user) external view returns (uint8);
    function setReputationScore(address user, uint8 score) external;
}
