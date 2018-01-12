import EthUtils from 'ethereumjs-util';
import keythereum from 'keythereum';

class Signer {
  constructor () {
    this.key = null;
  }

  getOrNewKeyPair = () => {
    if (!this.key) {
      this.key = keythereum.create({ keyBytes: 32, ivBytes: 16 }).privateKey;
    }

    return '0x' + this.key.toString('hex');
  }

  importPrivateKey = (privateKey) => {
    this.key = Buffer.from(privateKey, 'hex');
  }

  sign = (msgHash) => {
    return EthUtils.ecsign(msgHash, this.key);
  }

  verify = (message, signature) => {
    let msgHash = EthUtils.sha3(message);
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), msgHash]));
    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    let address = '0x' + EthUtils.pubToAddress(publicKey).toString('hex');
    return address;
  }

  getPrivateKey () {
    return '0x' + this.key.toString('hex');
  }

  getPublicKey () {
    return '0x' + EthUtils.privateToPublic(this.key).toString('hex');
  }

  getAddress () {
    return '0x' + EthUtils.privateToAddress(this.key).toString('hex');
  }
}

export default Signer;
