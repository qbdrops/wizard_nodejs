import NodeRSA from 'node-rsa';
import constants from 'constants';
import assert from 'assert';

class Cipher {
  constructor () {
    this.privateKey = null;
    this.publicKey = null;
  }

  getOrNewKeyPair = () => {
    if (!this.privateKey) {
      let key = new NodeRSA({ encryptionScheme: { scheme: 'pkcs1', padding: constants.RSA_NO_PADDING } }).generateKeyPair(2048);
      this.publicKey = key.exportKey('public');
      this.privateKey = key.exportKey('private');
    }

    return this.privateKey;
  }

  importPrivateKey = (privateKey) => {
    let key = new NodeRSA(privateKey, { encryptionScheme: { scheme:'pkcs1', padding: constants.RSA_NO_PADDING } });
    this.publicKey = key.exportKey('public');
    this.privateKey = key.exportKey('private');
  }

  encrypt = (message, publicKey = null) => {
    assert(publicKey || this.publicKey, 'Please do getOrNewKeyPair() first.');
    if (publicKey) {
      let key = new NodeRSA(publicKey, { encryptionScheme: { scheme:'pkcs1', padding: constants.RSA_NO_PADDING } });
      return key.encrypt(message, 'base64');
    } else {
      let key = new NodeRSA(this.publicKey, { encryptionScheme: { scheme:'pkcs1', padding: constants.RSA_NO_PADDING } });
      return key.encrypt(message, 'base64');
    }
  }

  decrypt = (cipherMessage, privateKey = null) => {
    assert(privateKey || this.privateKey, 'Please do getOrNewKeyPair() first.');
    if (privateKey) {
      let key = new NodeRSA(privateKey, { encryptionScheme: { scheme:'pkcs1', padding: constants.RSA_NO_PADDING } });
      return key.decrypt(cipherMessage, 'utf8');
    } else {
      let key = new NodeRSA(this.privateKey, { encryptionScheme: { scheme:'pkcs1', padding: constants.RSA_NO_PADDING } });
      return key.decrypt(cipherMessage, 'utf8');
    }
  }

  getPrivateKey () {
    return this.privateKey;
  }

  getPublicKey () {
    return this.publicKey;
  }
}

export default Cipher;
