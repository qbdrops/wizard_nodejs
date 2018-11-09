import assert from 'assert';
import Infinitechain from '@/infinitechain';
import Client from '@/client';
import Auditor from '@/auditor';
import Server from '@/server';
import Verifier from '@/verifier';
import Event from '@/event';
import Signer from '@/signer';
import Gringotts from '@/gringotts';
import Contract from '@/contract';
import Memory from '@/storages/memory';
import Level from '@/storages/level';
import GoogleDrive from '@/sync/google-drive';

class InfinitechainBuilder {
  setNodeUrl (url) {
    this._nodeUrl = url;
    return this;
  }

  setWeb3Url (url) {
    this._web3Url = url;
    return this;
  }

  setSignerKey (key) {
    this._signerKey = key;
    return this;
  }

  setStorage (storage, db = null) {
    if (storage == 'memory') {
      this._storage = new Memory();
    } else if (storage == 'level') {
      this._storage = new Level(db);
    } else {
      throw new Error('Not supported storage type.');
    }

    return this;
  }

  setReceiptSyncer (driveName, credentials) {
    if (driveName == 'googleDrive') {
      let syncer = new GoogleDrive();
      let installed = credentials.installed;
      syncer.setCredentials(installed.client_id, installed.client_secret, installed.redirect_uris[0]);
      this.syncer = syncer;
    }

    return this;
  }

  setSyncerToken (token) {
    this.token = token;
    return this;
  }

  build () {
    assert(this._nodeUrl != undefined, '\'nodeUrl\' is not provided.');
    assert(this._web3Url != undefined, '\'web3Url\' is not provided.');
    assert(this._storage != undefined, '\'storage\' is not provided.');
    if (this.syncer) {
      this._storage.setReceiptSyncer(this.syncer);
    }

    let clientConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl,
      clientAddress: this._clientAddress,
      serverAddress: this._serverAddress,
      storage: this._storage
    };

    let auditorConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl,
      serverAddress: this._serverAddress,
      storage: this._storage
    };

    let serverConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
    };

    let eventConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl,
      storage: this._storage
    };

    let gringottsConfig = {
      nodeUrl: this._nodeUrl
    };

    let contractConfig = {
      web3Url: this._web3Url
    };

    let signerConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
    };

    let verifierConfig = {};

    let infinitechain = new Infinitechain();

    let signer = new Signer(signerConfig);
    infinitechain.setSigner(signer);

    // Generate keypair if key is not configured
    if (this._signerKey) {
      signer.importPrivateKey(this._signerKey);
    } else {
      signer.getOrNewKeyPair();
    }

    let gringotts = new Gringotts(gringottsConfig, infinitechain);
    infinitechain.setGringotts(gringotts);

    let contract = new Contract(contractConfig, infinitechain);
    infinitechain.setContract(contract);

    let verifier = new Verifier(verifierConfig, infinitechain);
    infinitechain.setVerifier(verifier);

    let event = new Event(eventConfig, infinitechain);
    infinitechain.setEvent(event);

    let client = new Client(clientConfig, infinitechain);
    infinitechain.setClient(client);

    let auditor = new Auditor(auditorConfig, infinitechain);
    infinitechain.setAuditor(auditor);
    // Create server object after signer and contract in order to use them in server
    let server = new Server(serverConfig, infinitechain);
    infinitechain.setServer(server);

    this._storage.setInfinitechain(infinitechain);
    if (this.syncer) {
      infinitechain.syncer = this.syncer;
      this.syncer.setInfinitechain(infinitechain);
      this.syncer.refreshToken(this.token);
    }

    return infinitechain;
  }
}

export default InfinitechainBuilder;
