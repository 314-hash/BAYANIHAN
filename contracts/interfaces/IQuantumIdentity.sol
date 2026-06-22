// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IQuantumIdentity {
    struct CitizenProfile {
        string nationalIdHash;
        string biometricHash;
        uint256 registrationTime;
        bool isVerified;
        uint8 identityType; // 0: Citizen, 1: Farmer, 2: Fisher, 3: MSME, 4: Freelancer, 5: OFW
    }

    function isCitizenVerified(address citizen) external view returns (bool);
    function getCitizenType(address citizen) external view returns (uint8);
    function verifyCitizen(address citizen, uint8 identityType) external;
    function getCitizenProfile(address citizen) external view returns (CitizenProfile memory);
}
