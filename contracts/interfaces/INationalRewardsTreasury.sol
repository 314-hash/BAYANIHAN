// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INationalRewardsTreasury {
    enum AllocationCategory {
        CommunityTreasury, // 0: 35%
        EcosystemRewards,  // 1: 25%
        CoreTeam,          // 2: 10%
        Founder,           // 3: 5%
        Validators,        // 4: 10%
        Liquidity,         // 5: 5%
        Marketing,         // 6: 5%
        Reserve,           // 7: 3%
        Advisors           // 8: 2%
    }

    function claimRewards(address recipient, uint256 amount, AllocationCategory category) external;
    function addAuthorizedContract(address contractAddr) external;
    function depositFunds(uint256 amount) external;
}
