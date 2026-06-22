# 🇵🇭 Bayanihan Quantum Commerce Chain - User Guide

Welcome to the **Bayanihan Quantum Commerce Chain (Phase 2)**. This guide outlines how to onboard, choose your role, verify your profile, and interact with the 5 Economic Pillars of the decentralized operating system.

---

## 🔑 Onboarding & Quantum Identity (SBT)

Every verified Filipino citizen is represented on-chain via a Soulbound Token (SBT) profile managed by the [`QuantumIdentity`](file:///c:/Users/janla/Bayanihan/contracts/core/QuantumIdentity.sol) contract. 

### 1. Registration
To register your profile:
* Submit your **National ID Hash** (e.g. PhilSys verification hash).
* Provide your **Biometric Hash** (for zero-knowledge biometric verification).
* Nominate **two (2) Recovery Guardians** (trusted citizens/relatives) to secure social recovery in case of private key loss.

### 2. Post-Quantum Cryptographic Agility
Bayanihan implements post-quantum signature verification (e.g. CRYSTALS-Dilithium). You can rotate your cryptographic keys through the user portal.
* In the **Quantum Identity** sidebar, click **"Simulate PQ Key Rotation"**.
* This triggers a key update on-chain, securing your identity profile against quantum threats.

---

## 🌾 Pillar 1: Agriculture & Fisheries (Farmer / Fisherfolk)

Designed to eliminate unnecessary middlemen, increase producer income, and track seafood sustainability.

### For Farmers & Fisherfolk
1. **Register Harvest/Catch**:
   * Navigate to the **Supply Chains** tab.
   * Input the Produce/Catch Type (e.g., *Abaca Hemp*, *Yellowfin Tuna*, *Rice*) and Volume in kilograms.
   * Toggle **Organic Produce** (triggers **2x rewards** from the National Rewards Treasury).
   * Toggle **Climate-Friendly** (makes your crop eligible for weather-based parametric insurance).
   * Click **"Mint Crop/Catch NFT"**.
2. **List Future Harvest (Forward Contract)**:
   * List your Crop NFT on the Direct-To-Consumer (DTC) marketplace by setting a price in BAYANI and a delivery deadline.

### For Buyers
* Browse active listings on the **Direct-To-Consumer Marketplace**.
* Click **"Buy Contract"** to lock the purchase price in escrow.
* Once the produce is delivered, click **"Confirm DTC Delivery"** to release escrowed funds to the producer (this distributes **3x rewards** to both parties).

---

## 🏪 Pillar 2: MSME Growth & Business Credit

Empowers micro, small, and medium enterprises (MSMEs) through transparent, off-balance-sheet activity logging and reputation tiers.

### 1. Log Transaction Volume
* Record daily transaction revenue in BAYANI on the **MSME Credit** tab.
* Logging revenue increases your **Business Credit Rating** (ranging from 300 to 850).

### 2. Credit Rating & Discount Tiers
Your FICO-mapped credit rating determines your platform discount tier:
* **Silver Tier (<680)**: Standard marketplace settings.
* **Gold Tier (680-749)**: 15% discount on marketplace fees + High Priority listing visibility.
* **Platinum Tier (750+)**: 50% discount on marketplace fees + 0% platform staking collateral requirements.

### 3. Customer Reviews
* Customers can rate your business (1 to 5 stars). 
* Receiving 5-star ratings boosts your credit rating, moving you closer to higher discount tiers.

---

## 💼 Pillar 3: Freelancer Milestone Escrows

Secures freelance services through milestone-based payments and dynamic reputation-based contract fees.

### For Clients
1. **Create Escrow**:
   * Input the Freelancer’s address, project budget (in BAYANI), and delivery deadline.
   * Click **"Fund and Open Escrow"** to lock the budget.
2. **Manage Escrow**:
   * Review submitted work. Click **"Approve & Release"** to issue funds to the freelancer.
   * If work fails parameters, click **"Dispute Work"** to raise an arbitration flag.

### For Freelancers
* Navigate to your active escrows list and click **"Submit Work"** when a milestone is completed.
* **Dynamic Fee Discount**: The escrow base contract fee is 2.0%. Your fee is dynamically reduced based on your **AI Reputation Score** (e.g., an 85/100 score results in a discounted 1.15% fee), rewarding high-quality contributors.

---

## 🏘️ Pillar 4: Barangay DAO Governance

Enables democratic, local community decision-making and infrastructure development.

1. **Stake BAYANI**:
   * Stake utility tokens to boost your voting power.
   * Total voting power = `100 Units` (Base Citizenship weight) + `Staked Booster` (staked amount * 0.5).
2. **Review Proposals & Treasury**:
   * Track the Barangay Cooperative Reserve balance.
   * Vote **"Yea"** or **"Nay"** on community infrastructure proposals (e.g., solar streetlights, cold storage facilities).
   * Once a proposal crosses execution thresholds, funds are disbursed automatically to vendor accounts.

---

## 🌏 Pillar 5: Diaspora Network & Real-World Assets (RWA)

Allows Overseas Filipino Workers (OFWs) to support local projects, fund relative loans, and purchase fractional RWA shares.

### 1. Peer-to-Peer Relative Loans
* Fund local cooperative micro-loans (e.g. Sugar mills, seafood storage) in 250 BAYANI tranches.
* Funding loans increases your **Diaspora Impact Score**. Reaching 50-point score milestones triggers **30 BAYANI** reward stipends from the National Rewards Treasury.

### 2. National Asset Tokenization (RWA)
* Acquire fractional shares of cooperative infrastructure projects (e.g. *Coconut Processing Center*, *Barangay Solar Microgrid*).
* **Yield Model**: In compliance with SEC guidelines, returns are distributed **exclusively as service discount credits** (e.g. cheaper electricity, copra processing discounts) rather than passive cash dividends, mitigating classification as unregistered securities.
