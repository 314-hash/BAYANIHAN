# 🇵🇭 BAYANIHAN QUANTUM COMMERCE CHAIN
## Technical Whitepaper: The Decentralized Economic Operating System

---

## 1. Introduction
The **Bayanihan Quantum Commerce Chain** represents a new paradigm in sovereign decentralized finance. Designed to address structural inefficiencies within the Philippine economy, Bayanihan establishes an integrated economic operating system. It bypasses agricultural intermediary friction, validates MSME creditworthiness via transaction-based reputation scoring, routes OFW remittance capital into community-backed assets, and implements democratic hyper-local governance DAOs.

---

## 2. System Architecture
Bayanihan is built on a modular three-tier smart contract stack that isolates roles, checks identity states, and routes token streams securely:

```text
┌─────────────────────────────────────────────────────────────┐
│                 GOVERNANCE & LEGACY LAYER                   │
│  BarangayDAO  │  HealthcareAssistance  │  HousingCooperative │
│  DiasporaNetwork  │  NationalAssetTokenization  │  BayaniLegacy  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SECTORAL ECONOMIC LAYER                     │
│  FarmerProsperity  │  FisherfolkRewards  │  MSMEGrowth       │
│  EducationRewards   │  FreelancerEscrow   │  RenewableEnergy  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 CORE INFRASTRUCTURE LAYER                   │
│      QuantumIdentity  │  AIReputationOracle  │  Treasury    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic Agility & Post-Quantum Resilience
Standard elliptic curve cryptography (ECDSA/secp256k1) is vulnerable to quantum computing attacks. To future-proof sovereign digital identities, [`QuantumIdentity.sol`](file:///c:/Users/janla/Bayanihan/contracts/core/QuantumIdentity.sol) implements **Cryptographic Agility**:

* **Algorithm Mapping Slots:** Instead of binding identities to static ECDSA public keys, profiles are mapped to generic public key structures:
  ```solidity
  struct PQKey {
      string algorithm; // "CRYSTALS-Dilithium", "Falcon", "SPHINCS+"
      bytes publicKey;
      uint256 updatedTime;
  }
  ```
* **Key Rotation Framework:** Citizens register two or more multi-sig guardians. If a citizen's active key is compromised or needs upgrading to a post-quantum standard, the guardians vote to map the profile to a new wallet address.
* **Biometric Hashes:** Citizen metadata is hashed using SHA-256 off-chain, ensuring private data is never stored on-chain.
* **Authority Key Protection:** Off-chain validator private signing keys are retrieved dynamically at runtime from an **OpenBao Secrets Manager** instance (or HSM) rather than being stored in plain-text, mitigating compromise of administrative signing authorities.

---

## 4. Sectoral Economics & Smart Contract Mechanics

### A. Agriculture & Fisheries (DTC Logistics & Parametric Insurance)
[`FarmerProsperity.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/FarmerProsperity.sol) and [`FisherfolkRewards.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/FisherfolkRewards.sol) replace centralized middlemen with direct-to-consumer forward-sale escrows:
* **Organic, DTC, and Export Multipliers:** To incentivize sustainable and direct supply chains, the Treasury distributes BAYANI rewards using the following multipliers:
  * Organic production = **2x** base reward
  * Direct-to-Consumer (DTC) settlement = **3x** base reward
  * Certified Export = **5x** base reward
* **Parametric Weather Insurance & Treasury Solvency Routing:** To resolve local contract solvency risks, all premiums collected are dynamically forwarded to the `NationalRewardsTreasury` reserve pool. In the event of extreme weather registered by a climate oracle (`CLIMATE_ORACLE_ROLE`), parametric claims are paid out directly from the Treasury's `Reserve` category allocation, assuring 100% solvency backup.

### B. MSME Credit Indexing & Dynamic Fee Tiers
[`MSMEGrowth.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/MSMEGrowth.sol) tracks business activity metrics to formulate credit ratings:
* **Credit Rating Formula:** Synthesizes monthly revenue growth, average customer review scores (1-5 stars), longevity (time registered), and community contributions (DAO donations):
  $$\text{Credit Score} = 300 + (T \times 125) + \frac{\text{Total Revenue}}{10^{22}}$$
  Where $T$ represents the merchant tier (Bronze to Platinum).
* **Benefits:** Platinum-tier merchants receive a **50% discount on marketplace transaction fees** and priority visibility rankings.

### C. Renewable Energy & Telemetry Verification
[`RenewableEnergy.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/RenewableEnergy.sol) incentivizes green energy generation:
* **Signed Telemetry Logs:** Smart meters sign telemetry logs containing `kwhGenerated` and `timestamp`. The contract validates these via ECDSA recovery against authorized `METER_ORACLE_ROLE` public keys.
* **Credits Accounting:** 1 kWh of verified clean energy generates **1 Energy Credit** and **1 Carbon Credit**, while triggering a treasury reward of **0.1 BAYANI** (paid from the Treasury's Cooperatives category).

---

## 5. Compliance & Regulatory Engineering

Bayanihan is designed to comply with Philippine financial perimeters:

### SEC CASP Alignment: Exemption from Securities Regulations
Under the Philippine SEC CASP framework, contracts that promise passive yield or dividends are treated as investment contracts (securities). Bayanihan mitigates this risk by:
1. **Utility-Discount RWA Yields:** In [`NationalAssetTokenization.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/NationalAssetTokenization.sol), shareholders of tokenized physical assets (such as dryers or warehouses) do not receive cash or token dividends. Instead, they receive **service utility discount points** (e.g. free storage space or energy credits), which they burn to reduce operational costs.
2. **SBT Reputation Profiles:** All credentials (education skill levels, farmer status, and merchant scores) are minted as **non-transferable Soulbound tokens** (overriding ERC-721/1155 transfer methods). This prevents secondary trading and speculative manipulation.

### BSP Circular No. 1108 Alignment: VASP Separation
* The on-chain system handles only utility-based tokens. There are **no direct fiat conversion rails (PHP)** inside the contracts. Conversions are handled through off-chain VASP partners, keeping smart contracts clear of unlicensed money transmission classifications.

---

## 6. Verification and Automated Testing
The entire suite compiles under Solidity compiler version `0.8.20` with optimizer enabled:
```bash
npx hardhat compile
```
All contracts are validated using a Hardhat test suite with 100% test coverage:
```bash
npx hardhat test
```
The test suite compiles all Solidity contracts (including interfaces and mocks) and executes 21 test scenarios to verify access controls, reward math, succession flows, and parametric insurance payouts.

### 🛡️ Automated Static Audits (Slither)
To guarantee cryptographic integrity and code safety, the suite is automatically audited for vulnerabilities using Trail of Bits' **Slither** framework. Static checks are configured in `slither.config.json` to monitor reentrancy vectors, uninitialized state variables, and permission checks. Check runs can be executed using the automated scripts:
```bash
# Windows
scripts\run-slither.bat

# Linux/macOS
./scripts/run-slither.sh
```

---

## 7. Live Mainnet Deployment — BSC Mainnet (July 2026)

The Bayanihan Quantum Commerce Chain is **live on the BNB Smart Chain Mainnet** (Chain ID `56`). All 17 contracts are deployed, mined, and publicly source-verified on BscScan.

**Deployer:** `0x1821F246a27287a2187E1D634B8883030fA14731`

| Layer | Contract | Address |
|---|---|---|
| Token | BayaniToken | [`0x472EA138...0831`](https://bscscan.com/address/0x472EA138Cb1F5E414082b39C0158bFec0c1c0831#code) |
| Token | BayaniNFT | [`0x17462560...Fec`](https://bscscan.com/address/0x1746256036e3698c3F4AdbB077a7eFC30D083Fec#code) |
| Core | QuantumIdentity | [`0x1963cfF2...9e`](https://bscscan.com/address/0x1963cfF2Aa81C0263C25BC32Abb83338057e5c9e#code) |
| Core | AIReputationOracle | [`0xe094214c...22A`](https://bscscan.com/address/0xe094214c40A4F2b220bdBca944d661F53094022A#code) |
| Core | NationalRewardsTreasury | [`0x919404d0...Bc7`](https://bscscan.com/address/0x919404d0999Ab19Eb71a2e652807acEDD8511Bc7#code) |
| Sectoral | FarmerProsperity | [`0x756a0Dd9...CD7`](https://bscscan.com/address/0x756a0Dd94Ce62d8b0ca980ccBef74b4056A95CD7#code) |
| Sectoral | FisherfolkRewards | [`0x071b68c7...659`](https://bscscan.com/address/0x071b68c7b278202D51b957a71A67b1363F313659#code) |
| Sectoral | MSMEGrowth | [`0xa048c0aa...97d`](https://bscscan.com/address/0xa048c0aac38F2053c30E783DbcC6613A48AC797d#code) |
| Sectoral | EducationRewards | [`0xfe1414Dc...c06`](https://bscscan.com/address/0xfe1414Dc827F1031B7ea23E37a760DDE16aA7c06#code) |
| Sectoral | FreelancerEscrow | [`0x3021f105...429`](https://bscscan.com/address/0x3021f105c2807Dd5eAB6B818CCd6B9cF68c92429#code) |
| Sectoral | RenewableEnergy | [`0x818a87Ca...db0`](https://bscscan.com/address/0x818a87Ca029403972b13b78cad470861FcEA4db0#code) |
| Community | BarangayDAO | [`0x9F99fe19...5B0`](https://bscscan.com/address/0x9F99fe192d95ADD839e9C2636F70268E621Fb5B0#code) |
| Community | HealthcareAssistance | [`0xC8D9eF95...fA`](https://bscscan.com/address/0xC8D9eF95241E90FD39895c7c86c32773A91c98fA#code) |
| Community | HousingCooperative | [`0x23c5Ef90...FfA`](https://bscscan.com/address/0x23c5Ef9077aeb96da1230aD0C49Bdc79943cbFfA#code) |
| Community | DiasporaNetwork | [`0xa62Ad870...842`](https://bscscan.com/address/0xa62Ad870d8BB023A0C26471Fdb5295308F53f842#code) |
| RWA | NationalAssetTokenization | [`0x9C5516Bc...53d`](https://bscscan.com/address/0x9C5516Bc084e57d174295c22a0fC27A00A92153d#code) |
| Legacy | BayaniLegacy | [`0x3204A414...Ef5`](https://bscscan.com/address/0x3204A4143a953e21A9A51D54a5D1DfdCaa961Ef5#code) |

All contract source code is publicly verifiable. The frontend Web3 portal dynamically resolves the mainnet address table when a user connects MetaMask on Chain ID `56`.

