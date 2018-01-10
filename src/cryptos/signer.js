import EthUtils from 'ethereumjs-util';
import keythereum from 'keythereum';

class Signer {
  constructor () {
    this.key = null;
  }

  generateKeyPair = async () => {
    if (!this.key) {
      this.key = keythereum.create({ keyBytes: 32, ivBytes: 16 }).privateKey;
    }
  }

  sign = async (message) => {
    let ethMsgHash = this._getEthMegHash(message);
    let signature = EthUtils.ecsign(ethMsgHash, Buffer.from(this.key, 'hex'));

    return {
      r: '0x' + signature.r.toString('hex'),
      s: '0x' + signature.s.toString('hex'),
      v: signature.v
    };
  }

  verify = async (message, signature) => {
    let ethMsgHash = this._getEthMegHash(message);
    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    return publicKey;
  }

  getPublicKey () {
    return EthUtils.privateToPublic(this.key).toString('hex');
  }

  getAddress () {
    return EthUtils.privateToAddress(this.key).toString('hex');
  }

  _getEthMegHash (message) {
    let msgHash = EthUtils.sha3(message);
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), msgHash]));
    return ethMsgHash;
  }
}

export default Signer;
