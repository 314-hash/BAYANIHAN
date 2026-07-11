import { ethers } from "ethers";

const addresses = {
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

for (const [key, addr] of Object.entries(addresses)) {
  try {
    const checksummed = ethers.getAddress(addr);
    console.log(`${key}:`);
    console.log(`  Original:   ${addr}`);
    console.log(`  Checksummed: ${checksummed}`);
    console.log(`  Match?      ${addr === checksummed ? "✅" : "❌"}`);
  } catch (err) {
    console.log(`${key}: ❌ INVALID ADDRESS ERROR: ${err.message}`);
  }
}
