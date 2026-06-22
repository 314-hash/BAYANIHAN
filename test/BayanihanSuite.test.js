const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bayanihan Quantum Commerce Chain - Phase 2 Advanced Suite", function () {
  let deployer, governor, validator, oracle, client, freelancer, farmer, fisher, ofw, buyer, guardian1, guardian2;
  
  // Core contracts
  let bayaniToken, bayaniNFT;
  let quantumIdentity, aiReputationOracle, nationalRewardsTreasury;
  
  // Feature contracts
  let farmerProsperity, fisherfolkRewards, msmeGrowth, educationRewards, freelancerEscrow;
  let renewableEnergy, barangayDAO, healthcareAssistance, housingCooperative;
  let diasporaNetwork, nationalAssetTokenization, bayaniLegacy;

  before(async function () {
    [deployer, governor, validator, oracle, client, freelancer, farmer, fisher, ofw, buyer, guardian1, guardian2] = await ethers.getSigners();

    // 1. Deploy Mocks
    const BayaniToken = await ethers.getContractFactory("BayaniToken");
    bayaniToken = await BayaniToken.deploy();

    const BayaniNFT = await ethers.getContractFactory("BayaniNFT");
    bayaniNFT = await BayaniNFT.deploy();

    // 2. Deploy Core Infrastructure
    const QuantumIdentity = await ethers.getContractFactory("QuantumIdentity");
    quantumIdentity = await QuantumIdentity.deploy();

    const AIReputationOracle = await ethers.getContractFactory("AIReputationOracle");
    aiReputationOracle = await AIReputationOracle.deploy();

    const NationalRewardsTreasury = await ethers.getContractFactory("NationalRewardsTreasury");
    nationalRewardsTreasury = await NationalRewardsTreasury.deploy(await bayaniToken.getAddress());

    // 3. Deploy Sectoral Economic Contracts
    const FarmerProsperity = await ethers.getContractFactory("FarmerProsperity");
    farmerProsperity = await FarmerProsperity.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await aiReputationOracle.getAddress(),
      await bayaniToken.getAddress(),
      await bayaniNFT.getAddress()
    );

    const FisherfolkRewards = await ethers.getContractFactory("FisherfolkRewards");
    fisherfolkRewards = await FisherfolkRewards.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniNFT.getAddress()
    );

    const MSMEGrowth = await ethers.getContractFactory("MSMEGrowth");
    msmeGrowth = await MSMEGrowth.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await aiReputationOracle.getAddress(),
      await bayaniToken.getAddress()
    );

    const EducationRewards = await ethers.getContractFactory("EducationRewards");
    educationRewards = await EducationRewards.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress()
    );

    const FreelancerEscrow = await ethers.getContractFactory("FreelancerEscrow");
    freelancerEscrow = await FreelancerEscrow.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await aiReputationOracle.getAddress(),
      await bayaniToken.getAddress()
    );

    const RenewableEnergy = await ethers.getContractFactory("RenewableEnergy");
    renewableEnergy = await RenewableEnergy.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress()
    );

    const BarangayDAO = await ethers.getContractFactory("BarangayDAO");
    barangayDAO = await BarangayDAO.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress()
    );

    const HealthcareAssistance = await ethers.getContractFactory("HealthcareAssistance");
    healthcareAssistance = await HealthcareAssistance.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress(),
      await bayaniNFT.getAddress()
    );

    const HousingCooperative = await ethers.getContractFactory("HousingCooperative");
    housingCooperative = await HousingCooperative.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress()
    );

    const DiasporaNetwork = await ethers.getContractFactory("DiasporaNetwork");
    diasporaNetwork = await DiasporaNetwork.deploy(
      await quantumIdentity.getAddress(),
      await nationalRewardsTreasury.getAddress(),
      await bayaniToken.getAddress()
    );

    const NationalAssetTokenization = await ethers.getContractFactory("NationalAssetTokenization");
    nationalAssetTokenization = await NationalAssetTokenization.deploy(
      await quantumIdentity.getAddress(),
      await bayaniToken.getAddress()
    );

    const BayaniLegacy = await ethers.getContractFactory("BayaniLegacy");
    bayaniLegacy = await BayaniLegacy.deploy(
      await quantumIdentity.getAddress(),
      await bayaniToken.getAddress(),
      await bayaniNFT.getAddress()
    );

    // 4. Setup Roles & Permissions
    const VALIDATOR_ROLE = await quantumIdentity.VALIDATOR_ROLE();
    const DISTRIBUTOR_ROLE = await nationalRewardsTreasury.DISTRIBUTOR_ROLE();
    const REPUTATION_ORACLE_ROLE = await aiReputationOracle.ORACLE_ROLE();
    const METER_ORACLE_ROLE = await renewableEnergy.METER_ORACLE_ROLE();
    
    // Set mocks setup roles
    const MINTER_ROLE = await bayaniNFT.MINTER_ROLE();
    await bayaniNFT.grantRole(MINTER_ROLE, await farmerProsperity.getAddress());
    await bayaniNFT.grantRole(MINTER_ROLE, await fisherfolkRewards.getAddress());
    await bayaniNFT.grantRole(MINTER_ROLE, await healthcareAssistance.getAddress());
    await bayaniNFT.grantRole(MINTER_ROLE, await bayaniLegacy.getAddress());

    // Register distributors to rewards treasury
    await nationalRewardsTreasury.addAuthorizedContract(await farmerProsperity.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await fisherfolkRewards.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await msmeGrowth.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await educationRewards.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await freelancerEscrow.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await renewableEnergy.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await barangayDAO.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await healthcareAssistance.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await housingCooperative.getAddress());
    await nationalRewardsTreasury.addAuthorizedContract(await diasporaNetwork.getAddress());

    // Register Validator & Oracles
    await quantumIdentity.grantRole(VALIDATOR_ROLE, validator.address);
    await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, oracle.address);
    await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, await msmeGrowth.getAddress());
    await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, await freelancerEscrow.getAddress());
    await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, await farmerProsperity.getAddress());
    await renewableEnergy.grantRole(METER_ORACLE_ROLE, oracle.address);

    // Fund the Rewards Treasury with tokens for testing (100k BAYANI)
    const initialFunds = ethers.parseEther("100000");
    await bayaniToken.approve(await nationalRewardsTreasury.getAddress(), initialFunds);
    await nationalRewardsTreasury.depositFunds(initialFunds);

    // Distribute tokens to participants for transaction simulations
    const distAmount = ethers.parseEther("10000");
    await bayaniToken.transfer(buyer.address, distAmount);
    await bayaniToken.transfer(client.address, distAmount);
    await bayaniToken.transfer(farmer.address, distAmount);
    await bayaniToken.transfer(ofw.address, distAmount);
  });

  describe("QuantumIdentity Integration", function () {
    it("Should allow registering and verifying different citizen types", async function () {
      // Register Farmer
      await quantumIdentity.connect(farmer).registerCitizen("FARMER_ID_HASH", "BIO_HASH_1", 1, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(farmer.address, 1);
      expect(await quantumIdentity.isCitizenVerified(farmer.address)).to.be.true;
      expect(await quantumIdentity.getCitizenType(farmer.address)).to.equal(1);

      // Register Freelancer
      await quantumIdentity.connect(freelancer).registerCitizen("FREE_ID_HASH", "BIO_HASH_2", 4, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(freelancer.address, 4);
      expect(await quantumIdentity.getCitizenType(freelancer.address)).to.equal(4);

      // Register OFW
      await quantumIdentity.connect(ofw).registerCitizen("OFW_ID_HASH", "BIO_HASH_3", 5, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(ofw.address, 5);
      expect(await quantumIdentity.getCitizenType(ofw.address)).to.equal(5);

      // Register Client (as generic Citizen = type 0)
      await quantumIdentity.connect(client).registerCitizen("CLIENT_ID_HASH", "BIO_HASH_4", 0, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(client.address, 0);
      expect(await quantumIdentity.getCitizenType(client.address)).to.equal(0);

      // Register Buyer (as generic Citizen = type 0)
      await quantumIdentity.connect(buyer).registerCitizen("BUYER_ID_HASH", "BIO_HASH_BUYER", 0, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(buyer.address, 0);
      expect(await quantumIdentity.isCitizenVerified(buyer.address)).to.be.true;
    });

    it("Should handle post-quantum key updates and social recovery", async function () {
      // Key update
      const pubKey = ethers.hexlify(ethers.toUtf8Bytes("dilithium-public-key-data"));
      await expect(quantumIdentity.connect(farmer).updatePQKey("CRYSTALS-Dilithium", pubKey))
        .to.emit(quantumIdentity, "PQKeyUpdated");

      const [algo, keyData] = await quantumIdentity.getPQKey(farmer.address);
      expect(algo).to.equal("CRYSTALS-Dilithium");
      expect(keyData).to.equal(pubKey);

      // Social Recovery: Farmer wallet lost, recover to a new wallet
      const newFarmerWallet = ethers.Wallet.createRandom(ethers.provider);
      
      // Guardians vote
      await quantumIdentity.connect(guardian1).initiateRecovery(farmer.address, newFarmerWallet.address);
      await expect(quantumIdentity.connect(guardian2).initiateRecovery(farmer.address, newFarmerWallet.address))
        .to.emit(quantumIdentity, "RecoveryExecuted");

      // Verify recovery transfer
      expect(await quantumIdentity.isCitizenVerified(newFarmerWallet.address)).to.be.true;
      expect(await quantumIdentity.isCitizenVerified(farmer.address)).to.be.false;
    });
  });

  describe("AIReputationOracle Systems", function () {
    it("Should set and get reputation scores securely", async function () {
      await expect(aiReputationOracle.connect(oracle).setReputationScore(freelancer.address, 85))
        .to.emit(aiReputationOracle, "ReputationUpdated");
      expect(await aiReputationOracle.getReputationScore(freelancer.address)).to.equal(85);
    });

    it("Should accept ECDSA signed reputation updates from oracle", async function () {
      const user = ofw.address;
      const score = 92;
      const nonce = await aiReputationOracle.getUserNonce(user);
      const oracleAddress = await aiReputationOracle.getAddress();

      // Sign payload
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint256", "address"],
        [user, score, nonce, oracleAddress]
      );
      const signature = await oracle.signMessage(ethers.toBeArray(messageHash));

      await expect(aiReputationOracle.setReputationScoreWithSignature(user, score, nonce, signature))
        .to.emit(aiReputationOracle, "ReputationUpdated");

      expect(await aiReputationOracle.getReputationScore(user)).to.equal(92);
    });
  });

  describe("NationalRewardsTreasury Safety caps", function () {
    it("Should enforce category percentage limits on payouts", async function () {
      const farmerCategory = 0; // Farmers (25% cap)
      // Total treasury historically received: 100k
      // Max allowed: 25k BAYANI
      
      // Let's claim 1k (allowed)
      const testClaim = ethers.parseEther("1000");
      
      // We need to call via an authorized contract (like farmerProsperity)
      // But we can also temporarily grant governor/deployer distributor role to test directly
      const DISTRIBUTOR_ROLE = await nationalRewardsTreasury.DISTRIBUTOR_ROLE();
      await nationalRewardsTreasury.grantRole(DISTRIBUTOR_ROLE, deployer.address);

      await expect(nationalRewardsTreasury.claimRewards(farmer.address, testClaim, farmerCategory))
        .to.emit(nationalRewardsTreasury, "RewardDistributed");

      // Try to exceed 25k (say claiming 26k)
      const excessiveClaim = ethers.parseEther("26000");
      await expect(nationalRewardsTreasury.claimRewards(farmer.address, excessiveClaim, farmerCategory))
        .to.be.revertedWith("Exceeds category budget allocation");
    });
  });

  describe("FarmerProsperity Economic Logic", function () {
    it("Should register harvest with crop NFT and Organic 2x rewards", async function () {
      // Register new farmer address since old one was recovered
      const newFarmer = farmer; // reuse signers
      
      // Make sure farmer is verified
      if (!(await quantumIdentity.isCitizenVerified(farmer.address))) {
        await quantumIdentity.connect(farmer).registerCitizen("FARMER_2", "BIO_HASH_1B", 1, [guardian1.address, guardian2.address]);
        await quantumIdentity.connect(validator).verifyCitizen(farmer.address, 1);
      }

      const balBefore = await bayaniToken.balanceOf(farmer.address);
      
      // Register Harvest: Organic (true), ClimateFriendly (true), WaterConserving (true)
      // Base: 10 BAYANI * 2 (organic) + 5 (climate) + 5 (water) = 30 BAYANI
      await expect(farmerProsperity.connect(farmer).registerHarvest("Rice", 100, true, true, true))
        .to.emit(farmerProsperity, "HarvestRegistered");

      const balAfter = await bayaniToken.balanceOf(farmer.address);
      expect(balAfter - balBefore).to.equal(ethers.parseEther("30"));
    });

    it("Should allow future harvest forward sale marketplace transactions", async function () {
      // Deployer lists harvest
      const nftId = 1; // Farmer already minted ID 1 from organic harvest above
      const price = ethers.parseEther("500");
      const deadline = (await ethers.provider.getBlock("latest")).timestamp + 86400; // 1 day

      // Farmer approves FarmerProsperity contract to transfer Crop NFT
      await bayaniNFT.connect(farmer).setApprovalForAll(await farmerProsperity.getAddress(), true);

      // List harvest
      await expect(farmerProsperity.connect(farmer).listFutureHarvest(nftId, price, deadline))
        .to.emit(farmerProsperity, "FutureHarvestListed");

      // Buyer purchases listing
      await bayaniToken.connect(buyer).approve(await farmerProsperity.getAddress(), price);
      await expect(farmerProsperity.connect(buyer).buyFutureHarvest(1)) // Listing ID 1
        .to.emit(farmerProsperity, "FutureHarvestSold");

      // Confirm delivery - Direct to Consumer (true), Export (false)
      // Triggering confirm delivery releases escrow payment and claims 3x Direct-To-Consumer bonus (10 * 3 = 30 BAYANI)
      const farmerBalBefore = await bayaniToken.balanceOf(farmer.address);
      await farmerProsperity.connect(buyer).confirmFutureHarvestDelivery(1, true, false);

      const farmerBalAfter = await bayaniToken.balanceOf(farmer.address);
      expect(farmerBalAfter - farmerBalBefore).to.equal(price + ethers.parseEther("30"));
    });
  });

  describe("FisherfolkRewards Traceability & Conservation", function () {
    it("Should log catches, verify sustainability scores, and reward conservation", async function () {
      // Register fisher
      await quantumIdentity.connect(fisher).registerCitizen("FISHER_ID", "BIO_HASH_FISHER", 2, [guardian1.address, guardian2.address]);
      await quantumIdentity.connect(validator).verifyCitizen(fisher.address, 2);

      // Log Catch
      await expect(fisherfolkRewards.connect(fisher).logCatch("Tuna", 250, "GPS_HASH_123", true))
        .to.emit(fisherfolkRewards, "CatchLogged");

      // Marine officer verifies: Protected Compliant (true), sustainability score (90), quality score (95)
      // Base: 5 + 10 (export) + 2.5 (protected compliance) = 17.5 BAYANI
      const fisherBalBefore = await bayaniToken.balanceOf(fisher.address);
      await expect(fisherfolkRewards.connect(deployer).verifyCatch(1, true, 90, 95))
        .to.emit(fisherfolkRewards, "CatchVerified");
      
      const fisherBalAfter = await bayaniToken.balanceOf(fisher.address);
      expect(fisherBalAfter - fisherBalBefore).to.equal(ethers.parseEther("17.5"));

      // Conservation activity: 3x base reward (15 BAYANI)
      await expect(fisherfolkRewards.connect(deployer).logConservationActivity(fisher.address, "Sanctuary Patrol", 15))
        .to.emit(fisherfolkRewards, "ConservationActivityLogged");
    });
  });

  describe("MSMEGrowth Metrics & Rewards", function () {
    it("Should track revenue, ratings, and upgrade merchant tiers", async function () {
      const merchant = ofw; // use OFW signer as merchant for validation
      // Re-verify as MSME (type 3)
      await quantumIdentity.connect(validator).verifyCitizen(merchant.address, 3);

      await msmeGrowth.connect(merchant).registerBusiness("Sari-Sari Store");

      // Log some business revenue (10k tokens)
      await msmeGrowth.logRevenue(merchant.address, ethers.parseEther("10000"));
      // Submit client reviews
      await msmeGrowth.submitReview(merchant.address, 5); // 5 star review
      
      // Fast forward time to trigger monthly epoch (31 days)
      await ethers.provider.send("evm_increaseTime", [31 * 86400]);
      await ethers.provider.send("evm_mine");

      // Process epoch rewards: dynamic calculations upgrade to Bronze tier
      await expect(msmeGrowth.processEpochRewards(merchant.address))
        .to.emit(msmeGrowth, "TierUpgraded");

      expect(await msmeGrowth.merchantTiers(merchant.address)).to.equal(4); // Platinum tier
      expect(await msmeGrowth.getMerchantFeeDiscount(merchant.address)).to.equal(5000); // 50% discount
    });
  });

  describe("FreelancerEscrow Escrow Milestones", function () {
    it("Should manage payments and rating-based reputation rewards", async function () {
      const budget = ethers.parseEther("1000");
      
      // Client approves escrow deposit (1000 BAYANI)
      await bayaniToken.connect(client).approve(await freelancerEscrow.getAddress(), budget);
      
      // Create project with 1 milestone (1000 BAYANI)
      const milestoneAmount = [budget];
      const milestoneDeadline = [(await ethers.provider.getBlock("latest")).timestamp + 86400];
      
      await expect(freelancerEscrow.connect(client).createProject(freelancer.address, milestoneAmount, milestoneDeadline))
        .to.emit(freelancerEscrow, "ProjectCreated");

      // Submit milestone
      await freelancerEscrow.connect(freelancer).submitMilestone(1);

      // Approve milestone (pays freelancer minus fee)
      const freeBalBefore = await bayaniToken.balanceOf(freelancer.address);
      await freelancerEscrow.connect(client).approveMilestone(1);
      const freeBalAfter = await bayaniToken.balanceOf(freelancer.address);
      
      expect(freeBalAfter - freeBalBefore).to.be.gt(0); // payout received

      // Complete project: 5 star + on-time triggers 15 BAYANI bonus
      const freeBalBeforeComplete = await bayaniToken.balanceOf(freelancer.address);
      await expect(freelancerEscrow.connect(client).completeProject(1, 5, true))
        .to.emit(freelancerEscrow, "ProjectCompleted");
      
      const freeBalAfterComplete = await bayaniToken.balanceOf(freelancer.address);
      expect(freeBalAfterComplete - freeBalBeforeComplete).to.equal(ethers.parseEther("15"));
    });
  });

  describe("RenewableEnergy Telemetry Logs", function () {
    it("Should verify smart meter generations and manage community energy pool", async function () {
      const producer = farmer.address;
      const kwh = 500;
      const deviceId = "SOLAR_METER_001";
      const timestamp = (await ethers.provider.getBlock("latest")).timestamp + 10;
      const energyAddress = await renewableEnergy.getAddress();

      // Sign telemetries
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "string", "uint256", "address"],
        [producer, kwh, deviceId, timestamp, energyAddress]
      );
      const signature = await oracle.signMessage(ethers.toBeArray(messageHash));

      // Log generation: 500 kWh = 50 BAYANI rewards
      const prodBalBefore = await bayaniToken.balanceOf(producer);
      await expect(renewableEnergy.logGeneration(producer, kwh, deviceId, timestamp, signature))
        .to.emit(renewableEnergy, "EnergyLogged");

      const prodBalAfter = await bayaniToken.balanceOf(producer);
      expect(prodBalAfter - prodBalBefore).to.equal(ethers.parseEther("50")); // 0.1 per kWh

      // Pool Deposit
      await renewableEnergy.connect(farmer).depositToPool("Barangay Solar Pool", 200);
      expect(await renewableEnergy.poolTotalDeposits("Barangay Solar Pool")).to.equal(200);
    });
  });

  describe("BarangayDAO Proposal Voting", function () {
    it("Should allow democratic voting with power caps and execute funding", async function () {
      const proposalFunding = ethers.parseEther("1000");
      // Fund DAO treasury (send 2000 BAYANI)
      await bayaniToken.transfer(await barangayDAO.getAddress(), ethers.parseEther("2000"));

      // Citizen stakes tokens for voting weight boost
      const stakeAmount = ethers.parseEther("50");
      await bayaniToken.connect(farmer).approve(await barangayDAO.getAddress(), stakeAmount);
      await barangayDAO.connect(farmer).stake(stakeAmount);

      // Create infrastructure funding proposal
      await expect(barangayDAO.connect(farmer).createProposal("Repair Barangay Hall", proposalFunding, validator.address, 0))
        .to.emit(barangayDAO, "ProposalCreated");

      // Vote (earns 1 BAYANI participation reward)
      const farmBalBefore = await bayaniToken.balanceOf(farmer.address);
      await expect(barangayDAO.connect(farmer).vote(1, true))
        .to.emit(barangayDAO, "Voted");

      const farmBalAfter = await bayaniToken.balanceOf(farmer.address);
      expect(farmBalAfter - farmBalBefore).to.equal(ethers.parseEther("1")); // active voting reward

      // Fast forward voting period (7 days)
      await ethers.provider.send("evm_increaseTime", [7 * 86400]);
      await ethers.provider.send("evm_mine");

      // Execute Proposal: releases 1000 BAYANI to validator address
      const valBalBefore = await bayaniToken.balanceOf(validator.address);
      await barangayDAO.executeProposal(1);
      const valBalAfter = await bayaniToken.balanceOf(validator.address);
      expect(valBalAfter - valBalBefore).to.equal(proposalFunding);
    });
  });

  describe("HealthcareAssistance Pool Management", function () {
    it("Should deposit savings, contribute to mutual insurance, and execute claims", async function () {
      const savings = ethers.parseEther("200");
      await bayaniToken.connect(farmer).approve(await healthcareAssistance.getAddress(), savings);
      await healthcareAssistance.connect(farmer).depositSavings(savings);
      
      expect(await healthcareAssistance.healthcareSavings(farmer.address)).to.equal(savings);

      // Submit medical emergency claim
      await expect(healthcareAssistance.connect(farmer).requestMedicalClaim(ethers.parseEther("150"), "INCIDENT_HASH_99"))
        .to.emit(healthcareAssistance, "MedicalClaimSubmitted");

      // Reviewer approves claim
      const farmerBalBefore = await bayaniToken.balanceOf(farmer.address);
      await expect(healthcareAssistance.connect(deployer).approveMedicalClaim(1))
        .to.emit(healthcareAssistance, "MedicalClaimApproved");
      
      const farmerBalAfter = await bayaniToken.balanceOf(farmer.address);
      expect(farmerBalAfter - farmerBalBefore).to.equal(ethers.parseEther("150"));
    });
  });

  describe("HousingCooperative mortgages", function () {
    it("Should manage shared equity funding and mortgages", async function () {
      await housingCooperative.connect(deployer).addProject("Barangay Housing Site A", ethers.parseEther("1000"));

      // Contribute to project equity shares
      const contrib = ethers.parseEther("500");
      await bayaniToken.connect(buyer).approve(await housingCooperative.getAddress(), contrib);
      await housingCooperative.connect(buyer).contributeToProject(1, contrib);

      expect(await housingCooperative.projectShares(1, buyer.address)).to.equal(contrib);

      // Apply for loan
      const loan = ethers.parseEther("200");
      await housingCooperative.connect(farmer).applyForMortgage(loan, ethers.parseEther("20"));
      
      // Approve loan (requires funding the coop treasury first with some cash)
      await bayaniToken.transfer(await housingCooperative.getAddress(), ethers.parseEther("1000"));
      await expect(housingCooperative.connect(deployer).approveMortgage(1))
        .to.emit(housingCooperative, "MortgageApproved");
    });
  });

  describe("DiasporaNetwork OFW Lending", function () {
    it("Should register OFWs, open community loans, and track jobs created", async function () {
      // OFW profile registration
      // Re-verify as type 5 OFW since we reused the signers
      await quantumIdentity.connect(validator).verifyCitizen(ofw.address, 5);
      await diasporaNetwork.connect(ofw).registerOFW("Singapore");

      // Local borrower opens lending pool (target 100 BAYANI)
      const loanGoal = ethers.parseEther("100");
      await expect(diasporaNetwork.connect(farmer).createLendingPool(loanGoal, 500, 180 * 86400)) // 5% interest
        .to.emit(diasporaNetwork, "LoanPoolCreated");

      // OFW funds the pool
      await bayaniToken.connect(ofw).approve(await diasporaNetwork.getAddress(), loanGoal);
      await expect(diasporaNetwork.connect(ofw).fundLendingPool(1, loanGoal))
        .to.emit(diasporaNetwork, "LoanPoolFunded");

      expect(await diasporaNetwork.getDiasporaImpactScore(ofw.address)).to.equal(1); // 1 point for 100 BAYANI lent
    });
  });

  describe("NationalAssetTokenization Compliance & Yields", function () {
    it("Should tokenize dry warehouses and distribute non-dividend utility discount credits", async function () {
      // Register dry warehouse asset
      await nationalAssetTokenization.connect(deployer).registerAsset(
        "Barangay Warehouse Dryer",
        "Pampanga, PH",
        ethers.parseEther("5000"), // valuation
        100, // total shares
        ethers.parseEther("50") // price per share
      );

      // Buyer purchases 10 fractional shares
      const cost = ethers.parseEther("500");
      await bayaniToken.connect(buyer).approve(await nationalAssetTokenization.getAddress(), cost);
      await expect(nationalAssetTokenization.connect(buyer).purchaseShares(1, 10))
        .to.emit(nationalAssetTokenization, "SharesPurchased");

      expect(await nationalAssetTokenization.shareholderBalances(1, buyer.address)).to.equal(10);

      // Distribute service utility discounts (10 points per share = 100 points to buyer)
      await expect(nationalAssetTokenization.connect(deployer).distributeUtilityYield(1, 10))
        .to.emit(nationalAssetTokenization, "UtilityYieldDistributed");

      expect(await nationalAssetTokenization.utilityDiscounts(1, buyer.address)).to.equal(100);

      // Claim service discount
      await expect(nationalAssetTokenization.connect(buyer).claimUtilityServiceDiscount(1, 40))
        .to.emit(nationalAssetTokenization, "UtilityDiscountClaimed");

      expect(await nationalAssetTokenization.utilityDiscounts(1, buyer.address)).to.equal(60);
    });
  });

  describe("BayaniLegacy Trusts & Rewards", function () {
    it("Should setup trust vaults, enforce succession payouts, and reward builder statuses", async function () {
      // Setup family vault
      const timeout = 30 * 86400;
      const successors = [guardian1.address];
      const shares = [10000]; // 100% (10000 bps)

      await expect(bayaniLegacy.connect(farmer).createTrustVault(successors, shares, timeout))
        .to.emit(bayaniLegacy, "TrustVaultCreated");

      // Deposit assets
      const vaultFunds = ethers.parseEther("100");
      await bayaniToken.connect(farmer).approve(await bayaniLegacy.getAddress(), vaultFunds);
      await bayaniLegacy.connect(farmer).depositToVault(farmer.address, vaultFunds);

      // Fast forward past inactivity timeout (31 days)
      await ethers.provider.send("evm_increaseTime", [31 * 86400]);
      await ethers.provider.send("evm_mine");

      // Successor executes succession
      const succBalBefore = await bayaniToken.balanceOf(guardian1.address);
      await expect(bayaniLegacy.connect(guardian1).executeSuccession(farmer.address))
        .to.emit(bayaniLegacy, "SuccessionExecuted");

      const succBalAfter = await bayaniToken.balanceOf(guardian1.address);
      expect(succBalAfter - succBalBefore).to.equal(vaultFunds);

      // Developer simulate builder status rewards (Tier 3 = National Builder)
      await expect(bayaniLegacy.connect(deployer).devSimulateLegacyReward(farmer.address, 3))
        .to.emit(bayaniLegacy, "LegacyStatusClaimed");
    });
  });
});
