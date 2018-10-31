import EthUtils from 'ethereumjs-util';
import keythereum from 'keythereum';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';

class Signer {
  constructor () {
    this.key = null;
  }

  getOrNewKeyPair = () => {
    if (!this.key) {
      this.key = keythereum.create({ keyBytes: 32, ivBytes: 16 }).privateKey;
    }

    return this.key.toString('hex');
  }

  importPrivateKey = (privateKey) => {
    this.key = Buffer.from(privateKey, 'hex');
  }

  getPrivateKey () {
    assert(this.key != null, 'ECC private key does not exist. Please generate or import your keypair.');
    return this.key.toString('hex');
  }

  getPublicKey () {
    assert(this.key != null, 'ECC private key does not exist. Please generate or import your keypair.');
    return EthUtils.privateToPublic(this.key).toString('hex');
  }

  getAddress () {
    return EthUtils.privateToAddress(this.key).toString('hex');
  }

  signWithServerKey = (object) => {
    return this._sign('server', object);
  }

  signWithClientKey = (object) => {
    return this._sign('client', object);
  }

  _sign = (caller, object) => {
    let klass;
    if (object instanceof LightTransaction) {
      klass = 'lightTx';
    } else {
      throw new Error('\'object\' should be instance of \'LightTransaction\'.');
    }

    let hashKey = klass + 'Hash';
    let h = object[hashKey];
    let prefix = new Buffer('\x19Ethereum Signed Message:\n32');
    let message = EthUtils.sha3(Buffer.concat([prefix, Buffer.from(h, 'hex')]));
    let sig = EthUtils.ecsign(message, this.key);

    let postfix = klass.charAt(0).toUpperCase() + klass.slice(1);
    let sigKey = caller + postfix;
    object.sig[sigKey] = {
      r: '0x' + sig.r.toString('hex'),
      s: '0x' + sig.s.toString('hex'),
      v: '0x' + sig.v.toString(16).padStart(64, '0')
    };
    return object;
  }
}

export default Signer;
