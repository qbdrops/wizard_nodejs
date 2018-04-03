import IFC from '@/ifc';
import Client from '@/client';
import Server from '@/server';
import Event from '@/event';

import Crypto from '@/crypto';

import Sidechain from '@/sidechain';

import Memory from '@/storages/memory';
import Level from '@/storages/level';

class IFCBuilder {
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

  setCipherKey (key) {
    this._cipherKey = key;
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

  build = () => {
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

    let sidechainConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
    };

    let cryptoConfig = {
      web3Url: this._web3Url,
      nodeUrl: this._nodeUrl
    };

    let ifc = new IFC();

    let crypto = new Crypto(cryptoConfig, ifc);
    ifc.setCrypto(crypto);

    // Generate keypair if key is not configured
    if (this._signerKey != undefined && this._cipherKey != undefined) {
      crypto.importSignerKey(this._signerKey);
      crypto.importCipherKey(this._cipherKey);
    } else {
      crypto.getOrNewKeyPair();
    }

    let event = new Event(eventConfig, ifc);
    ifc.setEvent(event);

    // Create server object after crypto and sidechain in order to use them in server
    let sidechain = new Sidechain(sidechainConfig, ifc);
    ifc.setSidechain(sidechain);

    let client = new Client(clientConfig, ifc);
    ifc.setClient(client);

    // Create server object after crypto and sidechain in order to use them in server
    let server = new Server(serverConfig, ifc);
    ifc.setServer(server);

    return ifc;
  }
}

export default IFCBuilder;
