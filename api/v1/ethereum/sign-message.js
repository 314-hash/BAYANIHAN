import { ethers } from 'ethers';

/**
 * Digitally signs a message hash using the validator key
 * securely stored in the Vercel serverless environment.
 */
export default async function handler(req, res) {
  const token = req.headers['x-vault-token'];

  if (!token || token !== process.env.OPENBAO_TOKEN) {
    console.warn(JSON.stringify({
      event: "message_signing_unauthorized",
      message: "Invalid or missing X-Vault-Token",
      timestamp: new Date().toISOString()
    }));
    return res.status(403).json({ error: "Permission denied. Invalid or missing X-Vault-Token." });
  }

  const privateKey = process.env.VALIDATOR_PRIVATE_KEY;
  if (!privateKey) {
    console.error(JSON.stringify({
      event: "message_signing_server_error",
      message: "VALIDATOR_PRIVATE_KEY not configured in environment",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "VALIDATOR_PRIVATE_KEY not configured in environment." });
  }

  const { message } = req.body;
  if (!message) {
    console.warn(JSON.stringify({
      event: "message_signing_bad_request",
      message: "Missing 'message' string in body",
      timestamp: new Date().toISOString()
    }));
    return res.status(400).json({ error: "Missing 'message' string in request body." });
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    
    // Sign raw text or message bytes
    const signature = await wallet.signMessage(message);

    console.log(JSON.stringify({
      event: "message_signing_success",
      messageLength: message.length,
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({ signature });
  } catch (error) {
    console.error(JSON.stringify({
      event: "message_signing_failure",
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: `Message signing failed: ${error.message}` });
  }
}
