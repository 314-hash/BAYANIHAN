# 🇵🇭 Bayanihan Quantum Commerce Chain - Phase 2

Welcome to the **Bayanihan Quantum Commerce Chain** Advanced Smart Contract Suite (Phase 2). This suite extends the foundational payment and staking infrastructure of the Bayanihan network into a comprehensive, multi-sector digital nation economy.

The project is structured around localized, productive economic systems tailored to the Philippine regulatory context, supporting farmers, fisherfolk, MSMEs, students, freelancers, OFWs, and local community cooperatives.

---

## 🏛️ Project Directory Structure

The smart contracts are located in [`contracts/`](file:///c:/Users/janla/Bayanihan/contracts):

```text
c:/Users/janla/Bayanihan/
├── contracts/
│   ├── core/
│   │   ├── QuantumIdentity.sol          # Contract 18: Post-Quantum Identity & Social Recovery
│   │   ├── AIReputationOracle.sol        # Contract 16: ECDSA-Signed Reputation scoring
│   │   └── NationalRewardsTreasury.sol   # Contract 17: Multi-category rate-limited payouts
│   ├── features/
│   │   ├── FarmerProsperity.sol          # Contract 6: Harvests, Crop NFTs, forward sales escrow
│   │   ├── FisherfolkRewards.sol         # Contract 7: Catch logs, sustainability tracking
│   │   ├── MSMEGrowth.sol                # Contract 8: Revenue metrics, rating tiers, credit score
│   │   ├── EducationRewards.sol          # Contract 9: Soulbound course badges, scholarship pool
│   │   ├── FreelancerEscrow.sol          # Contract 10: Milestone payments, dispute resolution
│   │   ├── RenewableEnergy.sol           # Contract 14: Smart meter logs, energy & carbon credits
│   │   ├── BarangayDAO.sol               # Contract 11: Democratic voting with power caps
│   │   ├── HealthcareAssistance.sol      # Contract 12: Mutual health pools, emergency payouts
│   │   ├── HousingCooperative.sol        # Contract 13: Fractional equity, mortgage pools
│   │   ├── DiasporaNetwork.sol           # Contract 15: OFW registry, relative lending pools
│   │   ├── NationalAssetTokenization.sol  # Contract 19: Fractional RWAs with utility yields
│   │   └── BayaniLegacy.sol              # Contract 20: Inactivity trusts, succession execution
│   ├── interfaces/
│   │   ├── IQuantumIdentity.sol          # Standard identity check signatures
│   │   ├── IAIReputationOracle.sol       # Standard reputation check signatures
│   │   └── INationalRewardsTreasury.sol  # Reward categories (Farmers, OFWs, etc.)
│   └── mock/
│       ├── BayaniToken.sol               # ERC-20 Mock Token
│       └── BayaniNFT.sol                 # ERC-1155 Mock Certificate NFT
├── test/
│   └── BayanihanSuite.test.js            # Comprehensive automated Hardhat tests
├── package.json
└── hardhat.config.js
```

---

## 🏗️ Compliance & Security Agility

### SEC Classification Mitigation
* **Activity-Based Rewards:** Staking boosters and treasury reward releases are tied directly to active contributions (like generating clean energy, submitting crops, or voting) instead of passive investment returns.
* **Non-Dividend RWA Shares:** Fractional RWA assets in [`NationalAssetTokenization.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/NationalAssetTokenization.sol) distribute yield exclusively as functional utility discounts (such as warehouse space credits or solar energy discounts) to mitigate securities classification under SEC perimeter rules.
* **SBT Credentials:** Degree levels, identities, and reputations are non-transferable (soulbound) tokens to eliminate speculative secondary markets.

### BSP Circular No. 1108 (VASP Separation)
* The chain operates strictly at the crypto-utility layer. There are **zero direct fiat rails (PHP)** inside the contracts. Conversions are handled through off-chain VASP partners, keeping smart contracts clear of unlicensed remittance classifications.

### Cryptographic Agility
* [`QuantumIdentity.sol`](file:///c:/Users/janla/Bayanihan/contracts/core/QuantumIdentity.sol) contains flexible key storage slots mapping algorithm types to public keys. This ensures seamless support for post-quantum signatures (Dilithium, Falcon, or SPHINCS+) as soon as EVM precompiles become available.

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Compile Contracts
Compile the Solidity code using the Hardhat compiler:
```bash
npx hardhat compile
```

### 3. Run Test Suite
Run the automated Mocha/Chai test suite:
```bash
npx hardhat test
```

The test suite validates:
* **QuantumIdentity:** Profiles, key updates, and multi-guardian social recovery.
* **AIReputationOracle:** ECDSA-signed off-chain rating updates.
* **NationalRewardsTreasury:** Strict percentage allocation caps.
* **Farmer & Fisherfolk:** Multipliers, Crop/Catch certifications, weather-indexed insurance.
* **MSME & Freelancer:** Reputation scoring, credit checks, fee discounts, and milestone payouts.
* **BarangayDAO:** Staking, proposal funding, and democratic voting weight caps.
* **Coops, Energy, & Legacy:** Mutual pools, clean energy credits, loans, and succession trust execution.
