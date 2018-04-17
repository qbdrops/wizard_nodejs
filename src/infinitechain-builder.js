import Infinitechain from '@/infinitechain';
import Client from '@/client';
import Server from '@/server';
import Event from '@/event';
import Signer from '@/signer';
import Gringotts from '@/gringotts';
import Contract from '@/contract';
import Memory from '@/storages/memory';
import Level from '@/storages/level';

class InfinitechainBuilder {
  setNodeUrl (url) {
    this._nodeUrl = url;
    return this;
  }

  setWeb3Url (url) {
    this._web3Url = url;
    return this;
  }

  setClientAddress (address) {
    this._clientAddress = address;
    return this;
  }

  setServerAddress (address) {
    this._serverAddress = address;
    return this;
  }

  setSignerKey (key) {
    this._signerKey = key;
    return this;
  }

  setStorage (storage, db = null) {
    if (storage == 'memory') {
      this.storage = new Memory();
    } else if (storage == 'level') {
      this.storage = new Level(db);
    } else {
      throw new Error('Not supported storage type.');
    }

    return this;
  }

  build () {
    let clientConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl,
      clientAddress: this._clientAddress,
      serverAddress: this._serverAddress,
      storage: this.storage
    };

    let serverConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
    };

    let eventConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
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

    let infinitechain = new Infinitechain();

    let signer = new Signer(signerConfig);
    infinitechain.setSigner(signer);

    // Generate keypair if key is not configured
    if (this._signerKey != undefined) {
      signer.importPrivateKey(this._signerKey);
    } else {
      signer.getOrNewKeyPair();
    }

    let event = new Event(eventConfig, infinitechain);
    infinitechain.setEvent(event);

    let gringotts = new Gringotts(gringottsConfig, infinitechain);
    infinitechain.setGringotts(gringotts);

    let contract = new Contract(contractConfig, infinitechain);
    infinitechain.setContract(contract);

    let client = new Client(clientConfig, infinitechain);
    infinitechain.setClient(client);

    // Create server object after crypto and sidechain in order to use them in server
    let server = new Server(serverConfig, infinitechain);
    infinitechain.setServer(server);

    return infinitechain;
  }
}

export default InfinitechainBuilder;