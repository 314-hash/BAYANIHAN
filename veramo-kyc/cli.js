import { setupIssuer, issueCitizenVC, verifyVC, bridgeToBlockchain } from './service.js';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command || command === 'help') {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'init': {
        console.log("🇵🇭 [KYC System] Setting up Government Issuer Identity...");
        const issuerDid = await setupIssuer();
        console.log(`✅ Success! Government Issuer DID active: \x1b[33m${issuerDid}\x1b[0m`);
        break;
      }

      case 'issue': {
        const citizenAddress = args[1];
        const nidHash = args[2] || "NID_SIMULATED_HASH_12345";
        const biometricHash = args[3] || "BIO_SIMULATED_HASH_67890";
        const identityType = args[4] || "1"; // Type 1 = Farmer
        const outputPath = args[5] || "vc-citizen.json";

        if (!citizenAddress) {
          console.error("❌ Error: Citizen address is required. Usage: node cli.js issue <citizenAddress> [nidHash] [biometricHash] [identityType] [outputPath]");
          process.exit(1);
        }

        console.log(`🇵🇭 [KYC System] Issuing W3C Verifiable Credential for Citizen: ${citizenAddress}...`);
        const result = await issueCitizenVC(citizenAddress, nidHash, biometricHash, identityType);
        
        fs.writeFileSync(outputPath, JSON.stringify(result.verifiableCredential, null, 2), 'utf8');
        console.log(`✅ Success! Credential issued and saved to: \x1b[36m${outputPath}\x1b[0m`);
        console.log(`- Citizen DID: \x1b[32m${result.citizenDid}\x1b[0m`);
        console.log(`- Citizen Role Type: ${identityType}`);
        break;
      }

      case 'verify': {
        const vcPath = args[1];
        const shouldBridge = args.includes('--bridge');

        if (!vcPath) {
          console.error("❌ Error: VC file path is required. Usage: node cli.js verify <vcFilePath> [--bridge]");
          process.exit(1);
        }

        const fullPath = path.resolve(vcPath);
        if (!fs.existsSync(fullPath)) {
          console.error(`❌ Error: File not found at ${fullPath}`);
          process.exit(1);
        }

        console.log(`🇵🇭 [KYC System] Loading and verifying credential: ${vcPath}...`);
        const rawVc = fs.readFileSync(fullPath, 'utf8');
        const vc = JSON.parse(rawVc);

        const verification = await verifyVC(vc);
        if (verification.success) {
          console.log("✅ Success! Verifiable Credential signature is VALID.");
          console.log(`- Issuer DID: \x1b[33m${verification.issuer}\x1b[0m`);
          console.log("- Claims verified:");
          console.log(`  * Citizen Address: \x1b[32m${verification.subject.citizenAddress}\x1b[0m`);
          console.log(`  * National ID Hash: ${verification.subject.nationalIdHash}`);
          console.log(`  * Biometric Hash: ${verification.subject.biometricHash}`);
          console.log(`  * Citizen Role Type: ${verification.subject.identityType}`);

          if (shouldBridge) {
            console.log("\n🔗 Bridging verification status to on-chain QuantumIdentity contract...");
            try {
              const bridgeResult = await bridgeToBlockchain(
                verification.subject.citizenAddress,
                verification.subject.identityType
              );
              console.log("✅ Blockchain verification SUCCESS.");
              console.log(`- Tx Hash: \x1b[36m${bridgeResult.txHash}\x1b[0m`);
              console.log(`- Confirmed in Block: ${bridgeResult.blockNumber}`);
            } catch (err) {
              console.error(`❌ Blockchain bridging error: ${err.message}`);
              process.exit(1);
            }
          }
        } else {
          console.error("❌ Verification failed! Error Details:", JSON.stringify(verification.error, null, 2));
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
  }
}

function printHelp() {
  console.log("\n==================================================================");
  console.log("🇵🇭 BAYANIHAN QUANTUM COMMERCE CHAIN - VERAMO KYC CLI UTILITY");
  console.log("==================================================================\n");
  console.log("Commands:");
  console.log("  init                                                          Initialize government issuer DID");
  console.log("  issue <address> [nid] [bio] [type] [output]                   Issue W3C VC for a citizen address");
  console.log("  verify <vcFile> [--bridge]                                    Verify VC and optionally bridge state to blockchain");
  console.log("  help                                                          Display this help message\n");
}

main();
