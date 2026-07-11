import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const rpcUrl = process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org/";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const address = "0x919404d0999ab19eb71a2e652807acedd8511bc7";
  const code = await provider.getCode(address);
  console.log(`Address: ${address}`);
  console.log(`Bytecode length: ${code.length}`);
  if (code === "0x") {
    console.log("❌ No bytecode found (it is an EOA or not deployed).");
  } else {
    console.log("✅ Bytecode exists on-chain!");
  }
}

main().catch(console.error);
