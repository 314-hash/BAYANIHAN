import { ethers } from "ethers";
const addr = "0x919404d0999ab19eb71a2e652807acedd8511bc7";
console.log(`Original:   ${addr}`);
console.log(`Checksummed: ${ethers.getAddress(addr)}`);
