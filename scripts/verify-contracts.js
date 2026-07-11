import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  // Raw addresses from deploy output
  const rawAddresses = {
    BayaniToken: "0x472EA138Cb1F5E414082b39C0158bFec0c1c0831",
    BayaniNFT: "0x1746256036e3698c3F4AdbB077a7eFC30D083Fec",
    QuantumIdentity: "0x1963cfF2Aa81C0263C25BC32Abb83338057e5c9e",
    AIReputationOracle: "0xe094214c40A4F2b220bdBca944d661F53094022A",
    NationalRewardsTreasury: "0x919404d0999Ab19Eb71a2e652807acEDD8511Bc7",
    FarmerProsperity: "0x756a0Dd94Ce62d8b0ca980ccBef74b4056A95CD7",
    FisherfolkRewards: "0x071b68c7b278202D51b957a71A67b1363F313659",
    MSMEGrowth: "0xa048c0aac38F2053c30E783DbcC6613A48AC797d",
    EducationRewards: "0xfe1414Dc827F1031B7ea23E37a760DDE16aA7c06",
    FreelancerEscrow: "0x3021f105c2807Dd5eAB6B818CCd6B9cF68c92429",
    RenewableEnergy: "0x818a87Ca029403972b13b78cad470861FcEA4db0",
    BarangayDAO: "0x9F99fe192d95ADD839e9C2636F70268E621Fb5B0",
    HealthcareAssistance: "0xC8D9eF95241E90FD39895c7c86c32773A91c98fA",
    HousingCooperative: "0x23c5Ef9077aeb96da1230aD0C49Bdc79943cbFfA",
    DiasporaNetwork: "0xa62Ad870d8BB023A0C26471Fdb5295308F53f842",
    NationalAssetTokenization: "0x9C5516Bc084e57d174295c22a0fC27A00A92153d",
    BayaniLegacy: "0x3204A4143a953e21A9A51D54a5D1DfdCaa961Ef5"
  };

  // Convert all addresses to valid EIP-55 checksum addresses
  const addresses = {};
  for (const [key, val] of Object.entries(rawAddresses)) {
    addresses[key] = ethers.getAddress(val.toLowerCase());
  }

  const verifyQueue = [
    { name: "BayaniToken", address: addresses.BayaniToken, args: [] },
    { name: "BayaniNFT", address: addresses.BayaniNFT, args: [] },
    { name: "QuantumIdentity", address: addresses.QuantumIdentity, args: [] },
    { name: "AIReputationOracle", address: addresses.AIReputationOracle, args: [] },
    {
      name: "NationalRewardsTreasury",
      address: addresses.NationalRewardsTreasury,
      args: [addresses.BayaniToken]
    },
    {
      name: "FarmerProsperity",
      address: addresses.FarmerProsperity,
      args: [
        addresses.QuantumIdentity,
        addresses.NationalRewardsTreasury,
        addresses.AIReputationOracle,
        addresses.BayaniToken,
        addresses.BayaniNFT
      ]
    },
    {
      name: "FisherfolkRewards",
      address: addresses.FisherfolkRewards,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniNFT]
    },
    {
      name: "MSMEGrowth",
      address: addresses.MSMEGrowth,
      args: [
        addresses.QuantumIdentity,
        addresses.NationalRewardsTreasury,
        addresses.AIReputationOracle,
        addresses.BayaniToken
      ]
    },
    {
      name: "EducationRewards",
      address: addresses.EducationRewards,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniToken]
    },
    {
      name: "FreelancerEscrow",
      address: addresses.FreelancerEscrow,
      args: [
        addresses.QuantumIdentity,
        addresses.NationalRewardsTreasury,
        addresses.AIReputationOracle,
        addresses.BayaniToken
      ]
    },
    {
      name: "RenewableEnergy",
      address: addresses.RenewableEnergy,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniToken]
    },
    {
      name: "BarangayDAO",
      address: addresses.BarangayDAO,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniToken]
    },
    {
      name: "HealthcareAssistance",
      address: addresses.HealthcareAssistance,
      args: [
        addresses.QuantumIdentity,
        addresses.NationalRewardsTreasury,
        addresses.BayaniToken,
        addresses.BayaniNFT
      ]
    },
    {
      name: "HousingCooperative",
      address: addresses.HousingCooperative,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniToken]
    },
    {
      name: "DiasporaNetwork",
      address: addresses.DiasporaNetwork,
      args: [addresses.QuantumIdentity, addresses.NationalRewardsTreasury, addresses.BayaniToken]
    },
    {
      name: "NationalAssetTokenization",
      address: addresses.NationalAssetTokenization,
      args: [addresses.QuantumIdentity, addresses.BayaniToken]
    },
    {
      name: "BayaniLegacy",
      address: addresses.BayaniLegacy,
      args: [addresses.QuantumIdentity, addresses.BayaniToken, addresses.BayaniNFT]
    }
  ];

  console.log("====================================================");
  console.log("🛡️ Starting BscScan Verification with Correct Checksums...");
  console.log("====================================================");

  for (const contract of verifyQueue) {
    console.log(`\n🔍 Verifying ${contract.name} at ${contract.address}...`);
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.args
      });
      console.log(`✅ ${contract.name} verified successfully!`);
    } catch (err) {
      if (err.message.includes("Already Verified") || err.message.includes("already verified")) {
        console.log(`ℹ️ ${contract.name} is already verified.`);
      } else {
        console.error(`❌ Failed to verify ${contract.name}:`, err.message);
      }
    }
  }

  console.log("\n====================================================");
  console.log("🎉 Verification Run Completed!");
  console.log("====================================================");
}

main().catch(console.error);
