import EthUtils from 'ethereumjs-util';
import keythereum from 'keythereum';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';

const models = {
  lightTransaction: LightTransaction
};

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

  getPrivateKey () {
    assert(this.key != null, 'ECC private key does not exist. Please generate or import your keypair.');
    return '0x' + this.key.toString('hex');
  }

  getPublicKey () {
    assert(this.key != null, 'ECC private key does not exist. Please generate or import your keypair.');
    return '0x' + EthUtils.privateToPublic(this.key).toString('hex');
  }

  getAddress () {
    return '0x' + EthUtils.privateToAddress(this.key).toString('hex');
  }

  sign = (caller, klass, object) => {
    // 'klass' should be 'lightTransction' or 'receipt'
    assert(Object.keys(models).includes(klass), '\'klass\' should be \'lightTransaction\' or \'receipt\'');
    // 'caller' should be 'server' or 'client'
    assert(['server', 'client'].includes(caller), '\'caller\' should be \'server\' or \'client\'');
    // 'object' should be instance of input model
    assert(object instanceof models[klass], '\'object\' should be instance of \'' + klass + '\'.');

    let h = object.lightTxHash;
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let message = EthUtils.sha3(Buffer.concat([prefix, Buffer.from(String(h.length)), Buffer.from(h)]));
    let sig = EthUtils.ecsign(message, this.key);
    let key = caller + 'LightTxHash';
    object.sig[key] = {
      r: '0x' + sig.r.toString('hex'),
      s: '0x' + sig.s.toString('hex'),
      v: sig.v
    };
    return object;
  }

  _verify = (message, signature) => {
    let msgHash = EthUtils.sha3(message);
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), msgHash]));
    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    let address = '0x' + EthUtils.pubToAddress(publicKey).toString('hex');
    return address;
  }
}

export default Signer;
