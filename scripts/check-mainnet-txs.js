import dotenv from "dotenv";
dotenv.config();

async function main() {
  const address = "0x1821F246a27287a2187E1D634B8883030fA14731";
  const apiKey = process.env.BSCSCAN_API_KEY || "KTQTV5FD2XG88H8KZ61IPJZAAD6B6677GJ";
  const url = `https://api.etherscan.io/v2/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&chainid=56&apikey=${apiKey}`;

  console.log(`Fetching transaction list from BscScan for ${address}...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("BscScan API Response:", data);
    if (data.status !== "1") {
      console.error("❌ BscScan API Error:", data.message);
      return;
    }

    const txs = data.result;
    console.log(`Total transactions found: ${txs.length}`);

    for (const tx of txs) {
      if (tx.nonce === "5") {
        console.log("\n==============================================");
        console.log(`Transaction for Nonce 5 Found!`);
        console.log("==============================================");
        console.log(`- Hash: ${tx.hash}`);
        console.log(`- Block: ${tx.blockNumber}`);
        console.log(`- Timestamp: ${new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}`);
        console.log(`- From: ${tx.from}`);
        console.log(`- To: ${tx.to === "" ? "Contract Creation" : tx.to}`);
        console.log(`- Contract Address: ${tx.contractAddress}`);
        console.log(`- Gas Used: ${tx.gasUsed}`);
        console.log(`- Error Code (0 = success, 1 = error): ${tx.isError}`);
        console.log(`- Input (truncated): ${tx.input.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error("❌ Error fetching from BscScan:", error.message);
  }
}

main().catch(console.error);
