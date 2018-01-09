import KeyStore from '@/stores/key-store';

class Crypto {
  constructor (cryptoConfig, ifc) {
    this.ifc = ifc;
    this._keyStore = new KeyStore();
  }

  generateKeyPair = async () => {
    await this._keyStore.generateKeyPair();
  }

  sign = async (message) => {
    return await this._keyStore._signer.sign(message);
  }

  verify = async (message, signature) => {
    return await this._keyStore._signer.verify(message, signature);
  }

  encrypt = async (message, publicKey = null) => {
    return await this._keyStore._cipher.encrypt(message, publicKey);
  }

  decrypt = async (cipherMessage, privateKey = null) => {
    return await this._keyStore._cipher.decrypt(cipherMessage, privateKey);
  }

  getCipherPublicKey () {
    return this._keyStore._cipher.getPublicKey();
  }
}

export default Crypto;
