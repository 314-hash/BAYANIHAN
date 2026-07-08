# 🪙 BAYANIHAN QUANTUM COMMERCE CHAIN
## Tokenomics & Ecosystem Economic Model

This document details the utility models, allocation frameworks, emission rules, and macroeconomic modeling of the `BAYANI` token.

---

## 1. Core Token Utility
The `BAYANI` token is designed exclusively as a functional utility token supporting transactional execution, consensus voting, and community risk management:

```text
                       ┌──────────────────────┐
                       │     BAYANI TOKEN     │
                       └──────────┬───────────┘
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     ESCROW      │      │    GOVERNANCE   │      │    MUTUAL POOLS │
│  Harvest Sales  │      │  Barangay DAO   │      │  Health Co-op   │
│  Milestone Devs │      │  Staking Power  │      │  Mortgages      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

* **Escrow Lockup:** Used as the medium of exchange and collateral in Freelancer Escrows and Farmer Harvest Marketplaces.
* **Barangay Staking:** Staked by citizens to acquire voting weight boosters (capped to avoid plutocracy).
* **Mortgage Settlement:** Used to pay installments for cooperative home loans.
* **Mutual Health Pool Contributions:** Paid monthly to maintain active status and claim emergency subsidies.

---

## 2. National Rewards Treasury Allocation
Ecosystem reward emissions are distributed by the [`NationalRewardsTreasury.sol`](file:///c:/Users/janla/Bayanihan/contracts/core/NationalRewardsTreasury.sol) contract based on strict category allocations. The treasury enforces these caps dynamically as funding deposits grow:

| Category | Allocation | Primary Target Subsystem |
| :--- | :---: | :--- |
| **Community Treasury** | **35%** | Cooperative mortgages, health pools, safety nets |
| **Ecosystem Rewards** | **25%** | Farmers, fisherfolk, MSMEs, freelancers |
| **Core Team** | **10%** | Core development and operations contributors |
| **Founder** | **5%** | Platform founders and early builders |
| **Validators** | **10%** | Barangay proposal voting, project auditing |
| **Liquidity** | **5%** | Exchange liquidity and stability pools |
| **Marketing** | **5%** | Community outreach and merchant onboarding |
| **Reserve** | **3%** | Emergency reserve and long-term treasury |
| **Advisors** | **2%** | Strategic advisors and industry partners |

---

## 3. Emission & Reward Formulas

| Subsystem | Triggering Action | Reward Equation |
| :--- | :--- | :--- |
| **Farmers** | Organic Crop registry | $R = \text{Base} \times 2$ |
| **Farmers** | DTC Harvest sale | $R_{\text{dtc}} = \text{Base} \times 3$ |
| **Farmers** | Certified Export sale | $R_{\text{export}} = \text{Base} \times 5$ |
| **Fisherfolk** | Certified Catch registry | $R = \text{Base} + (\text{Export} \times 2) + \text{Protected Compliant} \times 0.5$ |
| **Freelancers** | 5-Star Rating + On-Time Delivery | $R_{\text{bonus}} = 15 \text{ BAYANI}$ |
| **Citizens** | Barangay Proposal Voting | $R_{\text{vote}} = 1 \text{ BAYANI}$ |
| **Renewable Energy**| Smart Meter kWh Generated | $R = \text{kWh} \times 0.1 \text{ BAYANI}$ |

---

## 4. Macroeconomic Valuation: The MV = PQ Model

We utilize the **Equation of Exchange** to evaluate token valuation through transactional utility:

$$M = \frac{P \times Q}{V}$$

Where:
* **$M$** = Required market capitalization of the token.
* **$P$** = Price index of ecosystem services (energy, crops, freelance work).
* **$Q$** = Quantity of transactions executed (ecosystem GDP).
* **$V$** = Velocity of the token.

### The Lockup Ratio ($L$) and Velocity Control
To support token valuation, the ecosystem is designed to lock tokens in active operations (escrows, staking, mutual reserves), reducing token velocity ($V$):

$$V = V_{\text{circ}} \times (1 - L)$$

Where $L$ is the **Lockup Ratio**, defined as the proportion of tokens locked in utility systems:

$$L = \frac{S_{\text{escrow}} + S_{\text{dao\_stake}} + S_{\text{health\_reserve}} + S_{\text{coop\_mortgage}}}{S_{\text{total}}}$$

If $L$ is engineered at **50%**, velocity $V$ is halved:

$$M = \frac{P \times Q}{V_{\text{circ}} \times 0.5} = 2 \times \frac{P \times Q}{V_{\text{circ}}}$$

Thus, locking tokens in utility pools doubles the required token capitalization ($M$) for any given transaction volume ($Q$), stabilizing token value organically through usage.

---

## 5. Regulatory Mitigation & Utility Points Yields
* **SEC Security Classification Mitigation:** Standard token systems distribute yields directly as tokens (which resembles interest/dividends). To comply with SEC perimeters, [`NationalAssetTokenization.sol`](file:///c:/Users/janla/Bayanihan/contracts/features/NationalAssetTokenization.sol) yields only **Utility Discount Points**. These points are burnt on-chain to claim discounts on services (e.g. warehouse space or solar grid usage) and cannot be traded on secondary markets.
* **Zero Speculative Trading of Credentials:** All credentials (education levels, merchant tiers) are issued as non-transferable (soulbound) profiles to eliminate speculative credential trading.
