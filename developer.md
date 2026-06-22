# 💻 Bayanihan - Developer Setup & Workflow Guide

Welcome to the developer guide for the **Bayanihan Quantum Commerce Chain** platform. This document contains instructions for setting up the local development environment, compiling smart contracts, running tests, testing the Veramo DID KYC CLI, and serving the frontend portal.

---

## 🛠️ Stack & Dependencies

The project uses the following developer toolsets:
- **Smart Contracts:** Solidity (EVM Paris target), Hardhat Development Environment.
- **Client & Blockchain Interactions:** Ethers.js (v6 UMD & ES modules).
- **Decentralized Identity:** Veramo Core DID & Credential framework (custom database-backed key stores).
- **Frontend Portal:** Semantic HTML5, Vanilla CSS (with glassmorphism layers), Custom JavaScript controllers.
- **Runtime:** Node.js (v18+ recommended).

---

## 📥 Getting Started

### 1. Clone the Repository & Install Dependencies
First, install the required packages defined in [`package.json`](file:///c:/Users/janla/Bayanihan/package.json):
```bash
npm install
```

### 2. Configure Environment (Optional)
If deploying to public EVM testnets, create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_wallet_private_key_here
PROVIDER_URL=your_rpc_provider_url_here
```

---

## 🏗️ Smart Contract Workflow

All smart contract source files reside in the [`contracts/`](file:///c:/Users/janla/Bayanihan/contracts) directory.

### Compile Contracts
Compile the 45 Solidity source files and interfaces using the Hardhat toolchain:
```bash
npm run compile
```
*Outputs: Compiled JSON files are generated in `artifacts/contracts/` and build caching is managed in `cache/`.*

### Run Tests
Execute the comprehensive test suite written in [`test/BayanihanSuite.test.js`](file:///c:/Users/janla/Bayanihan/test/BayanihanSuite.test.js) (validates RBAC permissions, escrows, weather payouts, and reputation scoring boundaries):
```bash
npm run test
```

---

## 🪪 Veramo KYC CLI System

Bayanihan uses an off-chain Decentralized Identity (DID) system to verify citizens before bridging their status onto the on-chain [`QuantumIdentity.sol`](file:///c:/Users/janla/Bayanihan/contracts/core/QuantumIdentity.sol) contract.

The lifecycle tool is operated through the CLI script [`veramo-kyc/cli.js`](file:///c:/Users/janla/Bayanihan/veramo-kyc/cli.js):

### 1. Initialize Issuer DID
Set up the Government Authority Issuer DID key in the local JSON database:
```bash
npm run kyc-init
```

### 2. Issue a signed Verifiable Credential (VC)
Generate a signed W3C Verifiable Credential for a citizen address:
```bash
npm run kyc-issue -- <citizen_address> <national_id_hash> <biometric_hash> <role_type> <output_json_path>
```
*Example:*
```bash
npm run kyc-issue -- 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 NID_FARMER_11 BIO_FARMER_HASH 1 veramo-kyc/vc-farmer.json
```

### 3. Verify VC & Bridge Status On-Chain
Verify the signature authenticity of the issued VC and push the verified state on-chain:
```bash
npm run kyc-verify -- <path_to_vc> --bridge
```
*Example:*
```bash
npm run kyc-verify -- veramo-kyc/vc-farmer.json --bridge
```

---

## 🌐 Running the Web3 Frontend Portal

The frontend is a lightweight, responsive client controller serving static assets from the [`frontend/`](file:///c:/Users/janla/Bayanihan/frontend) directory.

### Start local dev server
Launch the local web server on port 3000:
```bash
npm run frontend
```
Open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** in your browser.

### Staged Testing Scenarios
1. **Simulator Mode:** If no MetaMask wallet is connected or local Hardhat nodes are offline, the frontend automatically falls back to an interactive local simulator (allowing you to inspect roles, ratings, escrows, and RWA purchases entirely in-browser).
2. **Local Hardhat Network:** 
   - Start a local Hardhat node in a separate terminal:
     ```bash
     npx hardhat node
     ```
   - Connect MetaMask to **Localhost (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`)**.
   - Deploy contracts to local node:
     ```bash
     npx hardhat run scripts/deploy.js --network localhost
     ```
   - Click "Connect Wallet" in the portal header to interact with live Solidity contract calls.

---

## 🔒 Security & Code Quality Standards

When contributing code to this repository:
1. **Access Controls:** Protect all administrative entrypoints with appropriate roles (`GOVERNOR_ROLE`, `VALIDATOR_ROLE`).
2. **Reentrancy Guard:** Enforce `nonReentrant` modifiers on all methods transferring tokens or modifying balances, adhering strictly to the Checks-Effects-Interactions pattern.
3. **No Speculative Yields:** When tokenizing RWAs, returns must be structured as direct discounts or service rebates (utility) to prevent classification as unregistered security contracts under SEC perimeters.
4. **VASP Compliance:** Do not process fiat currency directly in the contracts. Let conversions happen through off-chain VASP partner portals.
