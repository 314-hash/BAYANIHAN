import { ethers } from "ethers";

const deployer = "0x1821F246a27287a2187E1D634B8883030fA14731";

console.log(`Deployer address: ${deployer}`);
console.log("\nDeterministic address calculations:");

for (let nonce = 0; nonce < 25; nonce++) {
  const contractAddr = ethers.getCreateAddress({
    from: deployer,
    nonce: nonce
  });
  console.log(`Nonce ${nonce}: ${contractAddr}`);
}
