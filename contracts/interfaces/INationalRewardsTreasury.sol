// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INationalRewardsTreasury {
    enum AllocationCategory {
        Farmers,      // 0: 25%
        OFWs,         // 1: 20%
        MSMEs,        // 2: 15%
        Developers,   // 3: 10%
        Cooperatives, // 4: 10%
        Validators,   // 5: 10%
        Education,    // 6: 5%
        EmergencyFund // 7: 5%
    }

    function claimRewards(address recipient, uint256 amount, AllocationCategory category) external;
    function addAuthorizedContract(address contractAddr) external;
}
