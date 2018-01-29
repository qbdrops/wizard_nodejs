import Cipher from '@/cryptos/cipher';
import Signer from '@/cryptos/signer';

class Crypto {
  constructor () {
    this._cipher = new Cipher();
    this._signer = new Signer();
  }

  getOrNewKeyPair = () => {
    let eccPrivateKey = this._signer.getOrNewKeyPair();
    let rsaPrivateKey = this._cipher.getOrNewKeyPair();

    return {
      eccPrivateKey: eccPrivateKey,
      rsaPrivateKey: rsaPrivateKey
    };
  }

  importSignerKey = (eccPrivateKey) => {
    this._signer.importPrivateKey(eccPrivateKey);
  }

  importCipherKey = (rsaPrivateKey) => {
    this._cipher.importPrivateKey(rsaPrivateKey);
  }

  sign = (message) => {
    return this._signer.sign(message);
  }

  verify = (message, signature) => {
    return this._signer.verify(message, signature);
  }

  encrypt = (message, publicKey = null) => {
    return this._cipher.encrypt(message, publicKey);
  }

  decrypt = (cipherMessage, privateKey = null) => {
    return this._cipher.decrypt(cipherMessage, privateKey);
  }

  getSignerAddress = () => {
    return this._signer.getAddress();
  }

  keyInfo () {
    let eccPrivateKey = this._signer.getPrivateKey();
    let eccPublicKey = this._signer.getPublicKey();
    let address = this._signer.getAddress();
    let rsaPrivateKey = this._cipher.getPrivateKey();
    let rsaPublicKey = this._cipher.getPublicKey();

    return {
      eccPrivateKey: eccPrivateKey,
      eccPublicKey: eccPublicKey,
      address: address,
      rsaPrivateKey: rsaPrivateKey,
      rsaPublicKey: rsaPublicKey
    };
  }
}

export default Crypto;
