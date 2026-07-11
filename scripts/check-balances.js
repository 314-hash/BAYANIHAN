import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log("❌ No PRIVATE_KEY found in .env");
    return;
  }

  // Create provider for BSC Testnet and Mainnet
  const bscTestnetRpc = process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/";
  const bscMainnetRpc = process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org/";

  const wallet = new ethers.Wallet(privateKey);
  console.log(`Address: ${wallet.address}`);

  try {
    const testnetProvider = new ethers.JsonRpcProvider(bscTestnetRpc);
    const testnetBalance = await testnetProvider.getBalance(wallet.address);
    console.log(`BSC Testnet Balance: ${ethers.formatEther(testnetBalance)} BNB`);
  } catch (error) {
    console.log(`❌ Error connecting to BSC Testnet: ${error.message}`);
  }

  try {
    const mainnetProvider = new ethers.JsonRpcProvider(bscMainnetRpc);
    const mainnetBalance = await mainnetProvider.getBalance(wallet.address);
    console.log(`BSC Mainnet Balance: ${ethers.formatEther(mainnetBalance)} BNB`);
  } catch (error) {
    console.log(`❌ Error connecting to BSC Mainnet: ${error.message}`);
  }
}

main().catch(console.error);
