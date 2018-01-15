import NodeRSA from 'node-rsa';
import constants from 'constants';
import assert from 'assert';

class Cipher {
  constructor (rsaPrivateKey) {
    this.privateKey = rsaPrivateKey;
    this.publicKey = null;
    this.key = null;
  }

  getOrNewKeyPair = () => {
    if (!this.key) {
      this.key = new NodeRSA({ encryptionScheme: { scheme: 'pkcs1', padding: constants.RSA_NO_PADDING } }).generateKeyPair(2048);
    }

    return this.key.exportKey('private');
  }

  importPrivateKey = (privateKey) => {
    this.key = privateKey;
  }

  encrypt = (message, publicKey = null) => {
    assert(publicKey || this.key, 'Please do getOrNewKeyPair() first.');
    if (publicKey) {
      let key = new NodeRSA(publicKey, {encryptionScheme:{scheme:'pkcs1', padding: constants.RSA_NO_PADDING}});
      return key.encrypt(message, 'base64');
    } else {
      return this.key.encrypt(message, 'base64');
    }
  }

  decrypt = (cipherMessage, privateKey = null) => {
    assert(privateKey || this.key, 'Please do getOrNewKeyPair() first.');
    if (privateKey) {
      let key = new NodeRSA(privateKey, {encryptionScheme:{scheme:'pkcs1', padding: constants.RSA_NO_PADDING}});
      return key.decrypt(cipherMessage, 'utf8');
    } else {
      return this.key.decrypt(cipherMessage, 'utf8');
    }
  }

  getPrivateKey () {
    return this.key.exportKey('private');
  }

  getPublicKey () {
    return this.key.exportKey('public');
  }
}

export default Cipher;
