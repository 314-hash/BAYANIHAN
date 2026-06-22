import { createAgent } from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { DIDManager } from '@veramo/did-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { KeyDIDProvider, getDidKeyResolver } from '@veramo/did-provider-key';
import { JsonPrivateKeyStore, JsonKeyStore, JsonDIDStore } from './json-stores.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'database.json');

import { Resolver } from 'did-resolver';

const privateKeyStore = new JsonPrivateKeyStore(DATA_FILE);
const keyStore = new JsonKeyStore(DATA_FILE);
const didStore = new JsonDIDStore(DATA_FILE);

export const agent = createAgent({
  plugins: [
    new KeyManager({
      store: keyStore,
      kms: {
        local: new KeyManagementSystem(privateKeyStore),
      },
    }),
    new DIDManager({
      store: didStore,
      defaultProvider: 'did:key',
      providers: {
        'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...getDidKeyResolver(),
      }),
    }),
    new CredentialPlugin(),
  ],
});
export default agent;
