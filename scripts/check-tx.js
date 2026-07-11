import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const rpcUrl = process.env.BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org/";
  console.log(`Connecting to: ${rpcUrl}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const txHash = "0xc1b90772e115d88070accc9139a6f39092587b4b456ac0ef484f28bee4c54d6c";
  
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log(`❌ Transaction ${txHash} not found on this node.`);
      return;
    }
    console.log("Transaction Details:");
    console.log(`- From: ${tx.from}`);
    console.log(`- To: ${tx.to}`);
    console.log(`- Value: ${ethers.formatEther(tx.value)} BNB`);
    console.log(`- Nonce: ${tx.nonce}`);
    console.log(`- Block Number: ${tx.blockNumber}`);

    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) {
      console.log("Transaction Receipt:");
      console.log(`- Status: ${receipt.status === 1 ? "✅ Success" : "❌ Reverted"}`);
      console.log(`- Contract Address: ${receipt.contractAddress}`);
      console.log(`- Gas Used: ${receipt.gasUsed.toString()}`);
    } else {
      console.log("⏳ Transaction is still pending or not yet mined.");
    }
  } catch (error) {
    console.error(`❌ Error fetching transaction: ${error.message}`);
  }
}

main().catch(console.error);
