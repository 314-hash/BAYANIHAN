import { ethers } from 'ethers';

/**
 * Returns the public Ethereum address of the validator wallet
 * without revealing the private key.
 */
export default function handler(req, res) {
  const token = req.headers['x-vault-token'];

  if (!token || token !== process.env.OPENBAO_TOKEN) {
    console.warn(JSON.stringify({
      event: "address_lookup_unauthorized",
      message: "Invalid or missing X-Vault-Token",
      timestamp: new Date().toISOString()
    }));
    return res.status(403).json({ error: "Permission denied. Invalid or missing X-Vault-Token." });
  }

  const privateKey = process.env.VALIDATOR_PRIVATE_KEY;
  if (!privateKey) {
    console.error(JSON.stringify({
      event: "address_lookup_server_error",
      message: "VALIDATOR_PRIVATE_KEY not configured in environment",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "VALIDATOR_PRIVATE_KEY not configured in environment." });
  }

  try {
    const wallet = new ethers.Wallet(privateKey);

    console.log(JSON.stringify({
      event: "address_lookup_success",
      address: wallet.address,
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({ address: wallet.address });
  } catch (error) {
    console.error(JSON.stringify({
      event: "address_lookup_failure",
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: error.message });
  }
}
