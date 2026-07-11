import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("====================================================");
    console.error("❌ Error: No deployer accounts found.");
    console.error("Please configure the PRIVATE_KEY variable in your '.env' file.");
    console.error("====================================================");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log("====================================================");
  console.log(`🚀 Starting Bayanihan Deployment to network...`);
  console.log(`Deployer Account: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} BNB`);
  console.log("====================================================");

  // 1. Deploy Mocks or Resolve Production Contracts
  console.log("\n1. Resolving Token and NFT Contracts...");
  let bayaniToken;
  let bayaniTokenAddr = process.env.BAYANI_TOKEN_ADDRESS || "";
  if (bayaniTokenAddr && ethers.isAddress(bayaniTokenAddr)) {
    console.log(`ℹ️ Using pre-existing BayaniToken at: ${bayaniTokenAddr}`);
    bayaniToken = await ethers.getContractAt("BayaniToken", bayaniTokenAddr);
  } else {
    console.log("🛠️ Deploying mock BayaniToken...");
    const BayaniToken = await ethers.getContractFactory("BayaniToken");
    bayaniToken = await BayaniToken.deploy();
    await bayaniToken.waitForDeployment();
    bayaniTokenAddr = await bayaniToken.getAddress();
    console.log(`✅ BayaniToken deployed to: ${bayaniTokenAddr}`);
  }

  let bayaniNFT;
  let bayaniNFTAddr = process.env.BAYANI_NFT_ADDRESS || "";
  if (bayaniNFTAddr && ethers.isAddress(bayaniNFTAddr)) {
    console.log(`ℹ️ Using pre-existing BayaniNFT at: ${bayaniNFTAddr}`);
    bayaniNFT = await ethers.getContractAt("BayaniNFT", bayaniNFTAddr);
  } else {
    console.log("🛠️ Deploying mock BayaniNFT...");
    const BayaniNFT = await ethers.getContractFactory("BayaniNFT");
    bayaniNFT = await BayaniNFT.deploy();
    await bayaniNFT.waitForDeployment();
    bayaniNFTAddr = await bayaniNFT.getAddress();
    console.log(`✅ BayaniNFT deployed to: ${bayaniNFTAddr}`);
  }

  // Configure BayaniNFT URI if set in environment
  let cropNftGatewayUrl = process.env.CROP_NFT_GATEWAY_URL || "";
  if (cropNftGatewayUrl) {
    try {
      // Append standard ERC1155 token identifier placeholder if not already present
      if (!cropNftGatewayUrl.includes("{id}")) {
        cropNftGatewayUrl = cropNftGatewayUrl.endsWith("/") 
          ? `${cropNftGatewayUrl}{id}.json` 
          : `${cropNftGatewayUrl}/{id}.json`;
      }
      console.log(`ℹ️ Setting BayaniNFT URI to: ${cropNftGatewayUrl}`);
      await (await bayaniNFT.setURI(cropNftGatewayUrl)).wait();
      console.log("✅ BayaniNFT URI configured successfully!");
    } catch (err) {
      console.warn("⚠️ Warning: Could not set URI on BayaniNFT:", err.message);
    }
  }

  // 2. Deploy Core Infrastructure
  console.log("\n2. Deploying Core Infrastructure...");
  const QuantumIdentity = await ethers.getContractFactory("QuantumIdentity");
  const quantumIdentity = await QuantumIdentity.deploy();
  await quantumIdentity.waitForDeployment();
  const quantumIdentityAddr = await quantumIdentity.getAddress();
  console.log(`✅ QuantumIdentity deployed to: ${quantumIdentityAddr}`);

  const AIReputationOracle = await ethers.getContractFactory("AIReputationOracle");
  const aiReputationOracle = await AIReputationOracle.deploy();
  await aiReputationOracle.waitForDeployment();
  const aiReputationOracleAddr = await aiReputationOracle.getAddress();
  console.log(`✅ AIReputationOracle deployed to: ${aiReputationOracleAddr}`);

  const NationalRewardsTreasury = await ethers.getContractFactory("NationalRewardsTreasury");
  const nationalRewardsTreasury = await NationalRewardsTreasury.deploy(bayaniTokenAddr);
  await nationalRewardsTreasury.waitForDeployment();
  const nationalRewardsTreasuryAddr = await nationalRewardsTreasury.getAddress();
  console.log(`✅ NationalRewardsTreasury deployed to: ${nationalRewardsTreasuryAddr}`);

  // 3. Deploy Sectoral Economic Contracts
  console.log("\n3. Deploying Sectoral Economic Contracts...");
  
  const FarmerProsperity = await ethers.getContractFactory("FarmerProsperity");
  const farmerProsperity = await FarmerProsperity.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    aiReputationOracleAddr,
    bayaniTokenAddr,
    bayaniNFTAddr
  );
  await farmerProsperity.waitForDeployment();
  const farmerProsperityAddr = await farmerProsperity.getAddress();
  console.log(`✅ FarmerProsperity deployed to: ${farmerProsperityAddr}`);

  const FisherfolkRewards = await ethers.getContractFactory("FisherfolkRewards");
  const fisherfolkRewards = await FisherfolkRewards.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniNFTAddr
  );
  await fisherfolkRewards.waitForDeployment();
  const fisherfolkRewardsAddr = await fisherfolkRewards.getAddress();
  console.log(`✅ FisherfolkRewards deployed to: ${fisherfolkRewardsAddr}`);

  const MSMEGrowth = await ethers.getContractFactory("MSMEGrowth");
  const msmeGrowth = await MSMEGrowth.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    aiReputationOracleAddr,
    bayaniTokenAddr
  );
  await msmeGrowth.waitForDeployment();
  const msmeGrowthAddr = await msmeGrowth.getAddress();
  console.log(`✅ MSMEGrowth deployed to: ${msmeGrowthAddr}`);

  const EducationRewards = await ethers.getContractFactory("EducationRewards");
  const educationRewards = await EducationRewards.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr
  );
  await educationRewards.waitForDeployment();
  const educationRewardsAddr = await educationRewards.getAddress();
  console.log(`✅ EducationRewards deployed to: ${educationRewardsAddr}`);

  const FreelancerEscrow = await ethers.getContractFactory("FreelancerEscrow");
  const freelancerEscrow = await FreelancerEscrow.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    aiReputationOracleAddr,
    bayaniTokenAddr
  );
  await freelancerEscrow.waitForDeployment();
  const freelancerEscrowAddr = await freelancerEscrow.getAddress();
  console.log(`✅ FreelancerEscrow deployed to: ${freelancerEscrowAddr}`);

  const RenewableEnergy = await ethers.getContractFactory("RenewableEnergy");
  const renewableEnergy = await RenewableEnergy.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr
  );
  await renewableEnergy.waitForDeployment();
  const renewableEnergyAddr = await renewableEnergy.getAddress();
  console.log(`✅ RenewableEnergy deployed to: ${renewableEnergyAddr}`);

  const BarangayDAO = await ethers.getContractFactory("BarangayDAO");
  const barangayDAO = await BarangayDAO.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr
  );
  await barangayDAO.waitForDeployment();
  const barangayDAOAddr = await barangayDAO.getAddress();
  console.log(`✅ BarangayDAO deployed to: ${barangayDAOAddr}`);

  const HealthcareAssistance = await ethers.getContractFactory("HealthcareAssistance");
  const healthcareAssistance = await HealthcareAssistance.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr,
    bayaniNFTAddr
  );
  await healthcareAssistance.waitForDeployment();
  const healthcareAssistanceAddr = await healthcareAssistance.getAddress();
  console.log(`✅ HealthcareAssistance deployed to: ${healthcareAssistanceAddr}`);

  const HousingCooperative = await ethers.getContractFactory("HousingCooperative");
  const housingCooperative = await HousingCooperative.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr
  );
  await housingCooperative.waitForDeployment();
  const housingCooperativeAddr = await housingCooperative.getAddress();
  console.log(`✅ HousingCooperative deployed to: ${housingCooperativeAddr}`);

  const DiasporaNetwork = await ethers.getContractFactory("DiasporaNetwork");
  const diasporaNetwork = await DiasporaNetwork.deploy(
    quantumIdentityAddr,
    nationalRewardsTreasuryAddr,
    bayaniTokenAddr
  );
  await diasporaNetwork.waitForDeployment();
  const diasporaNetworkAddr = await diasporaNetwork.getAddress();
  console.log(`✅ DiasporaNetwork deployed to: ${diasporaNetworkAddr}`);

  const NationalAssetTokenization = await ethers.getContractFactory("NationalAssetTokenization");
  const nationalAssetTokenization = await NationalAssetTokenization.deploy(
    quantumIdentityAddr,
    bayaniTokenAddr
  );
  await nationalAssetTokenization.waitForDeployment();
  const nationalAssetTokenizationAddr = await nationalAssetTokenization.getAddress();
  console.log(`✅ NationalAssetTokenization deployed to: ${nationalAssetTokenizationAddr}`);

  const BayaniLegacy = await ethers.getContractFactory("BayaniLegacy");
  const bayaniLegacy = await BayaniLegacy.deploy(
    quantumIdentityAddr,
    bayaniTokenAddr,
    bayaniNFTAddr
  );
  await bayaniLegacy.waitForDeployment();
  const bayaniLegacyAddr = await bayaniLegacy.getAddress();
  console.log(`✅ BayaniLegacy deployed to: ${bayaniLegacyAddr}`);

  // 4. Setup Roles & Permissions
  console.log("\n4. Configuring Roles & Authorizations...");
  
  // Set mocks setup roles
  if (bayaniNFT) {
    try {
      const MINTER_ROLE = await bayaniNFT.MINTER_ROLE();
      await (await bayaniNFT.grantRole(MINTER_ROLE, farmerProsperityAddr)).wait();
      await (await bayaniNFT.grantRole(MINTER_ROLE, fisherfolkRewardsAddr)).wait();
      await (await bayaniNFT.grantRole(MINTER_ROLE, healthcareAssistanceAddr)).wait();
      await (await bayaniNFT.grantRole(MINTER_ROLE, bayaniLegacyAddr)).wait();
      console.log("   - Granted MINTER_ROLE on BayaniNFT to sectoral contracts");
    } catch (err) {
      console.warn("⚠️ Warning: Could not grant MINTER_ROLE on BayaniNFT (deployer might lack admin rights):", err.message);
    }
  }

  // Register distributors to rewards treasury
  await (await nationalRewardsTreasury.addAuthorizedContract(farmerProsperityAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(fisherfolkRewardsAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(msmeGrowthAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(educationRewardsAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(freelancerEscrowAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(renewableEnergyAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(barangayDAOAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(healthcareAssistanceAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(housingCooperativeAddr)).wait();
  await (await nationalRewardsTreasury.addAuthorizedContract(diasporaNetworkAddr)).wait();
  console.log("   - Authorized sectoral contracts in NationalRewardsTreasury");

  // Register Validator & Oracles (granting to deployer address for operations/testing)
  const VALIDATOR_ROLE = await quantumIdentity.VALIDATOR_ROLE();
  await (await quantumIdentity.grantRole(VALIDATOR_ROLE, deployer.address)).wait();
  
  const REPUTATION_ORACLE_ROLE = await aiReputationOracle.ORACLE_ROLE();
  await (await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, deployer.address)).wait();
  await (await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, msmeGrowthAddr)).wait();
  await (await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, freelancerEscrowAddr)).wait();
  await (await aiReputationOracle.grantRole(REPUTATION_ORACLE_ROLE, farmerProsperityAddr)).wait();

  const METER_ORACLE_ROLE = await renewableEnergy.METER_ORACLE_ROLE();
  await (await renewableEnergy.grantRole(METER_ORACLE_ROLE, deployer.address)).wait();
  console.log("   - Configured Validator and Oracle roles to Deployer address");

  // 5. Fund the Rewards Treasury with tokens (e.g., 500,000 BAYANI)
  console.log("\n5. Funding the Rewards Treasury...");
  const initialFunds = ethers.parseEther("500000");
  try {
    const deployerBalance = await bayaniToken.balanceOf(deployer.address);
    if (deployerBalance >= initialFunds) {
      await (await bayaniToken.approve(nationalRewardsTreasuryAddr, initialFunds)).wait();
      await (await nationalRewardsTreasury.depositFunds(initialFunds)).wait();
      console.log(`   - Deposited ${ethers.formatEther(initialFunds)} BAYANI tokens into Treasury`);
    } else {
      console.warn(`⚠️ Warning: Deployer balance (${ethers.formatEther(deployerBalance)} BAYANI) is insufficient to fund the Treasury with ${ethers.formatEther(initialFunds)} BAYANI.`);
    }
  } catch (err) {
    console.warn("⚠️ Warning: Could not fund the Rewards Treasury automatically:", err.message);
  }

  // 6. Optional: Handoff roles to Gnosis Safe Multi-Sig (if configured in .env)
  const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || "";
  if (MULTISIG_ADDRESS && ethers.isAddress(MULTISIG_ADDRESS)) {
    console.log(`\n6. Transferring Admin & Governor Roles to Multi-Sig...`);
    const DEFAULT_ADMIN_ROLE = await quantumIdentity.DEFAULT_ADMIN_ROLE();
    const GOVERNOR_ROLE = await quantumIdentity.GOVERNOR_ROLE();
    
    // Grant roles to Multi-Sig on core contracts
    await (await quantumIdentity.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS)).wait();
    await (await quantumIdentity.grantRole(GOVERNOR_ROLE, MULTISIG_ADDRESS)).wait();
    await (await nationalRewardsTreasury.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS)).wait();
    await (await nationalRewardsTreasury.grantRole(GOVERNOR_ROLE, MULTISIG_ADDRESS)).wait();
    await (await aiReputationOracle.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS)).wait();
    await (await aiReputationOracle.grantRole(GOVERNOR_ROLE, MULTISIG_ADDRESS)).wait();
    
    // Revoke roles from deployer
    await (await quantumIdentity.revokeRole(GOVERNOR_ROLE, deployer.address)).wait();
    await (await quantumIdentity.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
    await (await nationalRewardsTreasury.revokeRole(GOVERNOR_ROLE, deployer.address)).wait();
    await (await nationalRewardsTreasury.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
    await (await aiReputationOracle.revokeRole(GOVERNOR_ROLE, deployer.address)).wait();
    await (await aiReputationOracle.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
    
    console.log(`   - Successfully handoff core contract roles to: ${MULTISIG_ADDRESS}`);
  } else {
    console.log("\n6. Handoff to Multi-Sig skipped (MULTISIG_ADDRESS not configured or invalid).");
  }

  console.log("\n====================================================");
  console.log("🎉 Bayanihan Deployment Completed Successfully!");
  console.log("====================================================");
  console.log(JSON.stringify({
    BayaniToken: bayaniTokenAddr,
    BayaniNFT: bayaniNFTAddr,
    QuantumIdentity: quantumIdentityAddr,
    AIReputationOracle: aiReputationOracleAddr,
    NationalRewardsTreasury: nationalRewardsTreasuryAddr,
    FarmerProsperity: farmerProsperityAddr,
    FisherfolkRewards: fisherfolkRewardsAddr,
    MSMEGrowth: msmeGrowthAddr,
    EducationRewards: educationRewardsAddr,
    FreelancerEscrow: freelancerEscrowAddr,
    RenewableEnergy: renewableEnergyAddr,
    BarangayDAO: barangayDAOAddr,
    HealthcareAssistance: healthcareAssistanceAddr,
    HousingCooperative: housingCooperativeAddr,
    DiasporaNetwork: diasporaNetworkAddr,
    NationalAssetTokenization: nationalAssetTokenizationAddr,
    BayaniLegacy: bayaniLegacyAddr
  }, null, 2));
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
