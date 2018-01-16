import IFC from '@/ifc';
import Server from '@/server';
import Event from '@/event';

import Crypto from '@/crypto';

import Sidechain from '@/sidechain';

class IFCBuilder {
  setNodeUrl (url) {
    this._nodeUrl = url;
    return this;
  }

  setWeb3Url (url) {
    this._web3Url = url;
    return this;
  }

  setServerAddress (address) {
    this._serverAddress = address;
    return this;
  }

  build = () => {
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

    let server = new Server(serverConfig, ifc);
    let crypto = new Crypto(cryptoConfig, ifc);
    let event = new Event(eventConfig, ifc);
    let sidechain = new Sidechain(sidechainConfig, ifc);

    ifc.setServer(server);
    ifc.setCrypto(crypto);
    ifc.setEvent(event);
    ifc.setSidechain(sidechain);

    return ifc;
  }
}

export default IFCBuilder;
