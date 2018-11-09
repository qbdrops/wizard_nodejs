import EthUtils from 'ethereumjs-util';
import keythereum from 'keythereum';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';

class Signer {
  constructor () {
    this.key = null;
  }

  generatePrivateKey = () => {
    let key = keythereum.create({ keyBytes: 32, ivBytes: 16 }).privateKey;
    return key.toString('hex');
  }

  importPrivateKey = (privateKey) => {
    assert(/^[0-9a-f]{64}$/i.test(privateKey), 'Private key is invalid.');
    this.key = Buffer.from(privateKey, 'hex');
  }

  hasPrivateKey = () => {
    return this.key != null;
  }

  getPrivateKey (privateKey = null) {
    if (privateKey) {
      assert(/^[0-9a-f]{64}$/i.test(privateKey), 'Private key is invalid.');
      return privateKey;
    } else {
      assert(this.hasPrivateKey(), 'ECC private key does not exist. Please generate or import your keypair.');
      return this.key.toString('hex');
    }
  }

  getPublicKey (privateKey = null) {
    return EthUtils.privateToPublic(Buffer.from(this.getPrivateKey(privateKey), 'hex')).toString('hex');
  }

  getAddress (privateKey = null) {
    return EthUtils.privateToAddress(Buffer.from(this.getPrivateKey(privateKey), 'hex')).toString('hex');
  }

  signWithServerKey = (object, privateKey = null) => {
    return this._sign('server', object, privateKey);
  }

  signWithClientKey = (object, privateKey = null) => {
    return this._sign('client', object, privateKey);
  }

  _sign = (caller, object, privateKey = null) => {
    let key = Buffer.from(this.getPrivateKey(privateKey), 'hex');
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
    let sig = EthUtils.ecsign(message, key);

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
