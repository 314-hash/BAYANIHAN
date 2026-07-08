import dotenv from 'dotenv';
dotenv.config();

/**
 * Fetch secret parameters from OpenBao (Vault KV v2 engine).
 * @returns {Promise<Object>} The secret KV data map.
 */
export async function fetchSecretFromBao() {
  const url = process.env.OPENBAO_URL;
  const token = process.env.OPENBAO_TOKEN;
  const path = process.env.OPENBAO_SECRET_PATH;

  if (!url || !token || !path) {
    throw new Error("Missing OpenBao configuration: OPENBAO_URL, OPENBAO_TOKEN, and OPENBAO_SECRET_PATH must be set.");
  }

  // Construct absolute API endpoint URL
  // e.g. http://127.0.0.1:8200/v1/secret/data/bayanihan/kyc
  const endpoint = `${url.replace(/\/$/, '')}/v1/${path.replace(/^\//, '')}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Vault-Token': token,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenBao request failed: status ${response.status} - ${errText}`);
    }

    const payload = await response.json();
    
    // KV v2 format returns: { data: { data: { ...your_secrets... } } }
    if (payload && payload.data && payload.data.data) {
      return payload.data.data;
    }

    // KV v1 fallback: { data: { ...your_secrets... } }
    if (payload && payload.data) {
      return payload.data;
    }

    throw new Error("OpenBao returned an invalid secret payload structure.");
  } catch (error) {
    console.error("❌ OpenBao Retrieval Error:", error.message);
    throw error;
  }
}
