import fs from 'fs';

export class JsonPrivateKeyStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.keys = {};
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.keys = parsed.privateKeys || {};
      } catch (e) {
        console.error("Failed to load JSON private key store:", e);
      }
    }
  }

  save() {
    let current = {};
    if (fs.existsSync(this.filePath)) {
      try {
        current = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch (e) {}
    }
    current.privateKeys = this.keys;
    fs.writeFileSync(this.filePath, JSON.stringify(current, null, 2), 'utf8');
  }

  async importKey(args) {
    this.keys[args.alias || args.kid] = args;
    this.save();
    return args;
  }

  async getKey(args) {
    const key = this.keys[args.alias || args.kid];
    if (!key) throw new Error(`Private key not found for: ${args.alias || args.kid}`);
    return key;
  }

  async deleteKey(args) {
    delete this.keys[args.alias || args.kid];
    this.save();
    return true;
  }

  async listKeys() {
    return Object.values(this.keys);
  }
}

export class JsonKeyStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.keys = {};
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.keys = parsed.keys || {};
      } catch (e) {
        console.error("Failed to load JSON key store:", e);
      }
    }
  }

  save() {
    let current = {};
    if (fs.existsSync(this.filePath)) {
      try {
        current = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch (e) {}
    }
    current.keys = this.keys;
    fs.writeFileSync(this.filePath, JSON.stringify(current, null, 2), 'utf8');
  }

  async importKey(args) {
    this.keys[args.kid] = args;
    this.save();
    return args;
  }

  async getKey(args) {
    const key = this.keys[args.kid];
    if (!key) throw new Error(`Key not found: ${args.kid}`);
    return key;
  }

  async deleteKey(args) {
    delete this.keys[args.kid];
    this.save();
    return true;
  }

  async listKeys() {
    return Object.values(this.keys);
  }
}

export class JsonDIDStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.identifiers = {};
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.identifiers = parsed.identifiers || {};
      } catch (e) {
        console.error("Failed to load JSON DID store:", e);
      }
    }
  }

  save() {
    let current = {};
    if (fs.existsSync(this.filePath)) {
      try {
        current = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch (e) {}
    }
    current.identifiers = this.identifiers;
    fs.writeFileSync(this.filePath, JSON.stringify(current, null, 2), 'utf8');
  }

  async importDID(args) {
    this.identifiers[args.did] = args;
    this.save();
    return true;
  }

  async getDID(args) {
    let id = null;
    if (args.did) {
      id = this.identifiers[args.did];
    } else if (args.alias && args.provider) {
      id = Object.values(this.identifiers).find(
        (i) => i.alias === args.alias && i.provider === args.provider
      );
    }
    if (!id) throw new Error("DID not found");
    return id;
  }

  async deleteDID(args) {
    delete this.identifiers[args.did];
    this.save();
    return true;
  }

  async listDIDs(args) {
    let list = Object.values(this.identifiers);
    if (args.alias) {
      list = list.filter((i) => i.alias === args.alias);
    }
    if (args.provider) {
      list = list.filter((i) => i.provider === args.provider);
    }
    return list;
  }
}
