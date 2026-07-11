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

---

## 🌐 BSC Mainnet Deployment — Live Contracts (July 2026)

All 17 contracts are **deployed, confirmed, and source-verified** on the **BNB Smart Chain Mainnet** (Chain ID `56`).

Deployer: `0x1821F246a27287a2187E1D634B8883030fA14731`

| Contract | Mainnet Address | BscScan |
|---|---|---|
| BayaniToken | `0x472EA138Cb1F5E414082b39C0158bFec0c1c0831` | [✅ Verified](https://bscscan.com/address/0x472EA138Cb1F5E414082b39C0158bFec0c1c0831#code) |
| BayaniNFT | `0x1746256036e3698c3F4AdbB077a7eFC30D083Fec` | [✅ Verified](https://bscscan.com/address/0x1746256036e3698c3F4AdbB077a7eFC30D083Fec#code) |
| QuantumIdentity | `0x1963cfF2Aa81C0263C25BC32Abb83338057e5c9e` | [✅ Verified](https://bscscan.com/address/0x1963cfF2Aa81C0263C25BC32Abb83338057e5c9e#code) |
| AIReputationOracle | `0xe094214c40A4F2b220bdBca944d661F53094022A` | [✅ Verified](https://bscscan.com/address/0xe094214c40A4F2b220bdBca944d661F53094022A#code) |
| NationalRewardsTreasury | `0x919404d0999Ab19Eb71a2e652807acEDD8511Bc7` | [✅ Verified](https://bscscan.com/address/0x919404d0999Ab19Eb71a2e652807acEDD8511Bc7#code) |
| FarmerProsperity | `0x756a0Dd94Ce62d8b0ca980ccBef74b4056A95CD7` | [✅ Verified](https://bscscan.com/address/0x756a0Dd94Ce62d8b0ca980ccBef74b4056A95CD7#code) |
| FisherfolkRewards | `0x071b68c7b278202D51b957a71A67b1363F313659` | [✅ Verified](https://bscscan.com/address/0x071b68c7b278202D51b957a71A67b1363F313659#code) |
| MSMEGrowth | `0xa048c0aac38F2053c30E783DbcC6613A48AC797d` | [✅ Verified](https://bscscan.com/address/0xa048c0aac38F2053c30E783DbcC6613A48AC797d#code) |
| EducationRewards | `0xfe1414Dc827F1031B7ea23E37a760DDE16aA7c06` | [✅ Verified](https://bscscan.com/address/0xfe1414Dc827F1031B7ea23E37a760DDE16aA7c06#code) |
| FreelancerEscrow | `0x3021f105c2807Dd5eAB6B818CCd6B9cF68c92429` | [✅ Verified](https://bscscan.com/address/0x3021f105c2807Dd5eAB6B818CCd6B9cF68c92429#code) |
| RenewableEnergy | `0x818a87Ca029403972b13b78cad470861FcEA4db0` | [✅ Verified](https://bscscan.com/address/0x818a87Ca029403972b13b78cad470861FcEA4db0#code) |
| BarangayDAO | `0x9F99fe192d95ADD839e9C2636F70268E621Fb5B0` | [✅ Verified](https://bscscan.com/address/0x9F99fe192d95ADD839e9C2636F70268E621Fb5B0#code) |
| HealthcareAssistance | `0xC8D9eF95241E90FD39895c7c86c32773A91c98fA` | [✅ Verified](https://bscscan.com/address/0xC8D9eF95241E90FD39895c7c86c32773A91c98fA#code) |
| HousingCooperative | `0x23c5Ef9077aeb96da1230aD0C49Bdc79943cbFfA` | [✅ Verified](https://bscscan.com/address/0x23c5Ef9077aeb96da1230aD0C49Bdc79943cbFfA#code) |
| DiasporaNetwork | `0xa62Ad870d8BB023A0C26471Fdb5295308F53f842` | [✅ Verified](https://bscscan.com/address/0xa62Ad870d8BB023A0C26471Fdb5295308F53f842#code) |
| NationalAssetTokenization | `0x9C5516Bc084e57d174295c22a0fC27A00A92153d` | [✅ Verified](https://bscscan.com/address/0x9C5516Bc084e57d174295c22a0fC27A00A92153d#code) |
| BayaniLegacy | `0x3204A4143a953e21A9A51D54a5D1DfdCaa961Ef5` | [✅ Verified](https://bscscan.com/address/0x3204A4143a953e21A9A51D54a5D1DfdCaa961Ef5#code) |

> Source code for all 17 contracts is publicly readable on BscScan. The frontend automatically connects to mainnet addresses when the user's MetaMask is on Chain ID `56`.

