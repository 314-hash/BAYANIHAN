import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY is not defined in .env");
    return;
  }

  // Deployed NFT address on BSC Testnet from latest run
  const nftAddress = "0xDe5810Bd3bf4912fd3c957D4138589A9dd729B4a";
  
  // Pinata URL
  const gatewayUrl = "https://amethyst-general-silkworm-428.mypinata.cloud/ipfs/bafybeidnykzaofqswd4cuzr4au2ecn56ty7mdkbjufzkty4zevbjb37q5y/{id}.json";

  console.log(`Connecting to BayaniNFT at: ${nftAddress}`);
  const bayaniNFT = await ethers.getContractAt("BayaniNFT", nftAddress);

  console.log(`Setting NFT URI to: ${gatewayUrl}`);
  const tx = await bayaniNFT.setURI(gatewayUrl);
  console.log(`Transaction submitted: ${tx.hash}`);
  await tx.wait();
  console.log("✅ NFT URI set successfully!");

  // Verify the URI on-chain
  const currentUri = await bayaniNFT.uri(1);
  console.log(`Current URI (for ID 1): ${currentUri}`);
}

main().catch(console.error);
