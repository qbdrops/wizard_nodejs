import NodeRSA from 'node-rsa';
import constants from 'constants';

class Cipher {
  constructor (rsaPrivateKey) {
    this.privateKey = rsaPrivateKey;
    this.publicKey = null;
    this.key = null;
  }

  generateKeyPair = async () => {
    if (!this.key) {
      this.key = new NodeRSA({ encryptionScheme: { scheme: 'pkcs1', padding: constants.RSA_NO_PADDING } }).generateKeyPair(2048);
    }
  }

  encrypt = async (message, publicKey = null) => {
    if (publicKey) {
      let key = new NodeRSA(publicKey, {encryptionScheme:{scheme:'pkcs1', padding: constants.RSA_NO_PADDING}});
      return key.encrypt(message, 'base64');
    } else {
      return this.key.encrypt(message, 'base64');
    }
  }

  decrypt = async (cipherMessage, privateKey = null) => {
    if (privateKey) {
      let key = new NodeRSA(privateKey, {encryptionScheme:{scheme:'pkcs1', padding: constants.RSA_NO_PADDING}});
      return key.decrypt(cipherMessage, 'utf8');
    } else {
      return this.key.decrypt(cipherMessage, 'utf8');
    }
  }

  getPublicKey () {
    return this.key.exportKey('public');
  }
}

export default Cipher;
