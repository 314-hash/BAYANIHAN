import { ethers } from 'ethers';

/**
 * Digitally signs a transaction payload using the validator key
 * securely stored in the Vercel serverless environment.
 * 
 * Implements Security Policy Guardrails & Transaction Validation:
 * 1. Checks that the recipient is exactly the QuantumIdentity contract.
 * 2. Decodes the data payload to ensure it is only calling `verifyCitizen(address,uint8)`.
 * 3. Populates missing chainId, nonce, and gas fees dynamically from the RPC provider if available.
 * 4. Outputs structured JSON logs to standard stdout for automatic stream ingestion by Vercel observability dashboards.
 */
export default async function handler(req, res) {
  const token = req.headers['x-vault-token'];

  // 1. Verify token authorization
  if (!token || token !== process.env.OPENBAO_TOKEN) {
    console.warn(JSON.stringify({
      event: "transaction_signing_unauthorized",
      message: "Invalid or missing X-Vault-Token",
      timestamp: new Date().toISOString()
    }));
    return res.status(403).json({ error: "Permission denied. Invalid or missing X-Vault-Token." });
  }

  const privateKey = process.env.VALIDATOR_PRIVATE_KEY;
  if (!privateKey) {
    console.error(JSON.stringify({
      event: "transaction_signing_server_error",
      message: "VALIDATOR_PRIVATE_KEY not configured in environment",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "VALIDATOR_PRIVATE_KEY not configured in environment." });
  }

  const { transaction } = req.body;
  if (!transaction) {
    console.warn(JSON.stringify({
      event: "transaction_signing_bad_request",
      message: "Missing 'transaction' object in body",
      timestamp: new Date().toISOString()
    }));
    return res.status(400).json({ error: "Missing 'transaction' object in request body." });
  }

  // 2. Security Guardrail: Enforce Target Address validation
  const targetAddress = process.env.QUANTUM_IDENTITY_ADDRESS;
  if (!targetAddress) {
    console.error(JSON.stringify({
      event: "transaction_signing_server_error",
      message: "QUANTUM_IDENTITY_ADDRESS not configured",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "QUANTUM_IDENTITY_ADDRESS environment variable is not configured." });
  }

  if (transaction.to.toLowerCase() !== targetAddress.toLowerCase()) {
    console.warn(JSON.stringify({
      event: "transaction_signing_policy_violation",
      message: "Target address mismatch",
      attemptedTo: transaction.to,
      allowedTo: targetAddress,
      timestamp: new Date().toISOString()
    }));
    return res.status(403).json({ 
      error: `Security Violation: Validator is restricted to call target address: ${targetAddress}. Attempted to call: ${transaction.to}` 
    });
  }

  // 3. Security Guardrail: Enforce Function Call validation via ABI decoding
  let parsedTx;
  try {
    const qiInterface = new ethers.Interface([
      "function verifyCitizen(address citizen, uint8 identityType)"
    ]);

    // Parse the input data to ensure it is a valid call to verifyCitizen
    parsedTx = qiInterface.parseTransaction({ data: transaction.data });
    if (!parsedTx || parsedTx.name !== "verifyCitizen") {
      console.warn(JSON.stringify({
        event: "transaction_signing_policy_violation",
        message: "Invalid function selector",
        timestamp: new Date().toISOString()
      }));
      return res.status(403).json({ 
        error: "Security Violation: Validator is restricted to call function 'verifyCitizen(address,uint8)'." 
      });
    }
  } catch (error) {
    console.warn(JSON.stringify({
      event: "transaction_signing_policy_violation",
      message: "Failed to parse function selector",
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    return res.status(403).json({ 
      error: `Security Violation: Invalid transaction data payload. Failed to parse function signature: ${error.message}` 
    });
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    let finalTx = { ...transaction };

    // 4. Gas & Nonce Optimization: Fetch from RPC node if RPC_URL is configured
    const rpcUrl = process.env.RPC_URL;
    if (rpcUrl) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Fetch network details to verify chainId compatibility
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        if (transaction.chainId && Number(transaction.chainId) !== chainId) {
          console.warn(JSON.stringify({
            event: "transaction_signing_chain_mismatch",
            requestedChainId: transaction.chainId,
            actualChainId: chainId,
            timestamp: new Date().toISOString()
          }));
          return res.status(400).json({ 
            error: `Chain ID mismatch: Node is on ${chainId}, transaction requested ${transaction.chainId}` 
          });
        }
        finalTx.chainId = chainId;

        // Auto-populate nonce if missing or stale
        if (finalTx.nonce === undefined || finalTx.nonce === null) {
          finalTx.nonce = await provider.getTransactionCount(wallet.address, "pending");
        }

        // Auto-populate gas pricing model (EIP-1559) if missing
        const feeData = await provider.getFeeData();
        if (!finalTx.maxFeePerGas && feeData.maxFeePerGas) {
          finalTx.maxFeePerGas = feeData.maxFeePerGas.toString();
        }
        if (!finalTx.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas) {
          finalTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toString();
        }
      } catch (rpcError) {
        console.warn(JSON.stringify({
          event: "transaction_signing_rpc_fallback",
          message: rpcError.message,
          timestamp: new Date().toISOString()
        }));
      }
    }

    // 5. Gas Limit and Gas Price Policy Threshold Enforcement
    const maxGasLimit = BigInt(process.env.MAX_GAS_LIMIT || "300000");
    const maxGasPrice = BigInt(process.env.MAX_GAS_PRICE || "100000000000"); // 100 Gwei (100 * 10^9 wei)

    if (finalTx.gasLimit) {
      const limit = BigInt(finalTx.gasLimit);
      if (limit > maxGasLimit) {
        console.warn(JSON.stringify({
          event: "transaction_signing_gas_violation",
          message: "Gas limit exceeded maximum allowed threshold",
          requested: limit.toString(),
          maxAllowed: maxGasLimit.toString(),
          timestamp: new Date().toISOString()
        }));
        return res.status(403).json({ 
          error: `Security Violation: Requested gas limit (${limit.toString()}) exceeds the maximum allowed threshold (${maxGasLimit.toString()}).` 
        });
      }
    }

    if (finalTx.gasPrice) {
      const price = BigInt(finalTx.gasPrice);
      if (price > maxGasPrice) {
        console.warn(JSON.stringify({
          event: "transaction_signing_gas_violation",
          message: "Gas price exceeded maximum allowed threshold",
          requested: price.toString(),
          maxAllowed: maxGasPrice.toString(),
          timestamp: new Date().toISOString()
        }));
        return res.status(403).json({ 
          error: `Security Violation: Requested gas price (${price.toString()}) exceeds the maximum allowed threshold (${maxGasPrice.toString()}).` 
        });
      }
    }

    if (finalTx.maxFeePerGas) {
      const maxFee = BigInt(finalTx.maxFeePerGas);
      if (maxFee > maxGasPrice) {
        console.warn(JSON.stringify({
          event: "transaction_signing_gas_violation",
          message: "Max fee per gas exceeded maximum allowed threshold",
          requested: maxFee.toString(),
          maxAllowed: maxGasPrice.toString(),
          timestamp: new Date().toISOString()
        }));
        return res.status(403).json({ 
          error: `Security Violation: Requested max fee per gas (${maxFee.toString()}) exceeds the maximum allowed threshold (${maxGasPrice.toString()}).` 
        });
      }
    }

    // Convert string-numeric fields back to BigInt where required by Ethers signTransaction
    const txToSign = {
      to: finalTx.to,
      data: finalTx.data,
      value: finalTx.value ? BigInt(finalTx.value) : undefined,
      gasLimit: finalTx.gasLimit ? BigInt(finalTx.gasLimit) : undefined,
      gasPrice: finalTx.gasPrice ? BigInt(finalTx.gasPrice) : undefined,
      maxFeePerGas: finalTx.maxFeePerGas ? BigInt(finalTx.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: finalTx.maxPriorityFeePerGas ? BigInt(finalTx.maxPriorityFeePerGas) : undefined,
      nonce: finalTx.nonce !== undefined && finalTx.nonce !== null ? Number(finalTx.nonce) : undefined,
      chainId: finalTx.chainId ? Number(finalTx.chainId) : undefined,
      type: finalTx.type !== undefined && finalTx.type !== null ? Number(finalTx.type) : 2, // Default to EIP-1559 (Type 2)
    };

    // 5. Sign the validated and optimized transaction
    const signedTransaction = await wallet.signTransaction(txToSign);

    console.log(JSON.stringify({
      event: "transaction_signing_success",
      citizenAddress: parsedTx.args[0],
      identityType: Number(parsedTx.args[1]),
      nonce: txToSign.nonce,
      chainId: txToSign.chainId,
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({ signedTransaction });
  } catch (error) {
    console.error(JSON.stringify({
      event: "transaction_signing_failure",
      error: error.message,
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: `Signing failed: ${error.message}` });
  }
}
