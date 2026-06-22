import express from 'express';
import cors from 'cors';
import { setupIssuer, issueCitizenVC, verifyVC, bridgeToBlockchain } from './service.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Initialize Veramo issuer DID on start
setupIssuer()
  .then((did) => {
    console.log(`🚀 Veramo KYC Agent initialized successfully with Issuer DID: ${did}`);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize Veramo issuer DID:', err.message);
  });

/**
 * Health check endpoint
 */
app.get('/api/kyc/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * Issue a signed Verifiable Credential for a citizen
 */
app.post('/api/kyc/issue', async (req, res) => {
  const { citizenAddress, nidHash, biometricHash, identityType } = req.body;

  if (!citizenAddress || !nidHash || !biometricHash || identityType === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: citizenAddress, nidHash, biometricHash, identityType.' });
  }

  try {
    console.log(`🆔 Issuing VC for Citizen Address: ${citizenAddress}, Role Type: ${identityType}`);
    const result = await issueCitizenVC(citizenAddress, nidHash, biometricHash, identityType);
    res.json(result);
  } catch (error) {
    console.error('❌ VC Issuance failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify a W3C Verifiable Credential
 */
app.post('/api/kyc/verify', async (req, res) => {
  const { vc } = req.body;

  if (!vc) {
    return res.status(400).json({ error: 'Missing parameter: vc.' });
  }

  try {
    console.log('🔍 Verifying Verifiable Credential signature...');
    const result = await verifyVC(vc);
    res.json(result);
  } catch (error) {
    console.error('❌ VC Verification failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify a Verifiable Credential and Bridge the verified state on-chain
 */
app.post('/api/kyc/bridge', async (req, res) => {
  const { vc } = req.body;

  if (!vc) {
    return res.status(400).json({ error: 'Missing parameter: vc.' });
  }

  try {
    console.log('🔍 Verifying VC before bridging to blockchain...');
    const verifyResult = await verifyVC(vc);

    if (!verifyResult.success) {
      return res.status(400).json({ error: `Invalid VC: ${verifyResult.error}` });
    }

    const { citizenAddress, identityType } = verifyResult.subject;
    console.log(`🔗 Bridging verified profile on-chain for ${citizenAddress}...`);
    
    const bridgeResult = await bridgeToBlockchain(citizenAddress, identityType);
    res.json({
      success: true,
      verifyResult,
      bridgeResult
    });
  } catch (error) {
    console.error('❌ VC Bridging failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`📡 Bayanihan Veramo KYC Server listening at http://localhost:${PORT}`);
});
