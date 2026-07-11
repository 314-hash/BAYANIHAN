import agent from './agent.js';
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { fetchSecretFromBao } from './openbao-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, 'database.json');
const PROVIDER_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const QUANTUM_IDENTITY_ADDRESS = process.env.QUANTUM_IDENTITY_ADDRESS || "0x51a1ceb83b83f1985a81c295d1ff28afef186e02";

// Async helper to dynamically load key from OpenBao, falling back to process.env or hardhat default key
async function getValidatorPrivateKey() {
  if (process.env.OPENBAO_URL && process.env.OPENBAO_TOKEN && process.env.OPENBAO_SECRET_PATH) {
    try {
      console.log("🔒 Resolving Validator Private Key from OpenBao...");
      const secrets = await fetchSecretFromBao();
      const keyProperty = process.env.OPENBAO_SECRET_KEY || "validator_private_key";
      if (secrets && secrets[keyProperty]) {
        console.log("✅ Key resolved from OpenBao successfully.");
        return secrets[keyProperty];
      }
    } catch (err) {
      console.warn("⚠️ Failed to retrieve key from OpenBao, falling back to local credentials:", err.message);
    }
  }
  return process.env.VALIDATOR_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
}

// Load QuantumIdentity ABI
const abiPath = path.resolve(__dirname, '../artifacts/contracts/core/QuantumIdentity.sol/QuantumIdentity.json');
let quantumIdentityAbi;
try {
  const fileContent = fs.readFileSync(abiPath, 'utf8');
  quantumIdentityAbi = JSON.parse(fileContent).abi;
} catch (e) {
  console.warn("Warning: Could not load on-chain build artifacts. Bridging will fall back to simulation logs. Run 'npx hardhat compile' if needed.");
}

/**
 * Setup or load the Government Issuer DID.
 */
export async function setupIssuer() {
  let db = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {}
  }

  if (db.issuerDid) {
    // Confirm DID exists in agent
    try {
      const identifier = await agent.didManagerGet({ did: db.issuerDid });
      return identifier.did;
    } catch (e) {
      console.log(`Issuer DID in DB (${db.issuerDid}) not found in agent key store. Recreating...`);
    }
  }

  // Create new did:key for issuer
  const identifier = await agent.didManagerCreate({
    alias: 'goverment-kyc-authority',
    provider: 'did:key'
  });

  // Save issuer DID back to DB
  db.issuerDid = identifier.did;
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');

  console.log(`Initialized Government Issuer DID: ${identifier.did}`);
  return identifier.did;
}

/**
 * Issue a KYC Verifiable Credential for a Citizen.
 */
export async function issueCitizenVC(citizenAddress, nidHash, biometricHash, identityType) {
  const issuerDid = await setupIssuer();

  // Create a DID for the citizen based on did:key
  const citizenIdentifier = await agent.didManagerCreate({
    alias: `citizen-${citizenAddress.toLowerCase()}`,
    provider: 'did:key'
  });

  console.log(`Generated Citizen DID: ${citizenIdentifier.did}`);

  // Create the signed W3C Verifiable Credential
  const vc = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: issuerDid },
      credentialSubject: {
        id: citizenIdentifier.did,
        citizenAddress: citizenAddress,
        nationalIdHash: nidHash,
        biometricHash: biometricHash,
        identityType: Number(identityType)
      }
    },
    proofFormat: 'jwt'
  });

  return {
    citizenDid: citizenIdentifier.did,
    verifiableCredential: vc
  };
}

/**
 * Verify a W3C Verifiable Credential signature.
 */
export async function verifyVC(vc) {
  try {
    const result = await agent.verifyCredential({
      credential: vc
    });

    if (result.verified) {
      return {
        success: true,
        issuer: result.verifiableCredential.issuer.id,
        subject: result.verifiableCredential.credentialSubject
      };
    } else {
      return {
        success: false,
        error: result.error || 'Verification failed.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bridge the verified credential state onto the Ethereum blockchain.
 */
export async function bridgeToBlockchain(citizenAddress, identityType) {
  if (!quantumIdentityAbi) {
    throw new Error("Cannot bridge to blockchain: QuantumIdentity.json build artifact not found.");
  }

  try {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const key = await getValidatorPrivateKey();

    // Safety check: Prevent using the default Hardhat private key on non-local networks
    const defaultHardhatKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const cleanedKey = key.trim().toLowerCase();
    const hasDefaultKey = cleanedKey === defaultHardhatKey || cleanedKey === defaultHardhatKey.substring(2);

    if (hasDefaultKey) {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      // Hardhat network chain ID is 31337; Localhost is 1337.
      if (chainId !== 31337 && chainId !== 1337) {
        throw new Error(`CRITICAL SECURITY FAILURE: Default Hardhat validator key cannot be used on non-local network (Chain ID: ${chainId}). Please configure a secure private key.`);
      }
    }

    const wallet = new ethers.Wallet(key, provider);
    const contract = new ethers.Contract(QUANTUM_IDENTITY_ADDRESS, quantumIdentityAbi, wallet);

    console.log(`Submitting on-chain verification tx for citizen ${citizenAddress}...`);
    const tx = await contract.verifyCitizen(citizenAddress, Number(identityType));
    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    throw new Error(`Blockchain bridging failed: ${error.message}`);
  }
}
