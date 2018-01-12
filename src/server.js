import EthUtils from 'ethereumjs-util';
import assert from 'assert';

class Server {
  constructor (serverConfig, ifc) {
    this.serverConfig = serverConfig;
    this.ifc = ifc;
  }

  validateRawTx = (rawTx) => {
    if (!rawTx.hasOwnProperty('from') ||
        !rawTx.hasOwnProperty('to') ||
        !rawTx.hasOwnProperty('value') ||
        !rawTx.hasOwnProperty('localSequenceNumber') ||
        !rawTx.hasOwnProperty('stageHeight') ||
        !rawTx.hasOwnProperty('data')) {
      return false;
    }

    let data = rawTx.data;

    if (!data.hasOwnProperty('pkUser') ||
        !data.hasOwnProperty('pkStakeholder')) {
      return false;
    }

    return true;
  }

  signTransaction = (rawTx) => {
    assert(this.validateRawTx(rawTx), 'Wrong rawTx format.');

    let stageHash = EthUtils.sha3(rawTx.stageHeight.toString()).toString('hex');

    let txHashAndCiphers = this._computeTxHashAndCiphers(rawTx);
    let txHash = txHashAndCiphers.txHash;
    let ciphers = txHashAndCiphers.ciphers;

    let message = stageHash + txHash;
    console.log(message);
    let msgHash = EthUtils.sha3(message);
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), msgHash]));
    
    console.log(ethMsgHash.toString('hex'));
    let signature = this.ifc.crypto.sign(ethMsgHash);

    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    let address = '0x' + EthUtils.pubToAddress(publicKey).toString('hex');
    console.log(address);

    assert(address == this.ifc.crypto.getSignerAddress(), 'Wrong signature.');

    return {
      stageHeight: rawTx.stageHeight,
      stageHash: stageHash.toString('hex'),
      txHash: txHash.toString('hex'),
      cipherUser: ciphers.cipherUser,
      cipherCP: ciphers.cipherCP,
      v: signature.v,
      r: '0x' + signature.r.toString('hex'),
      s: '0x' + signature.s.toString('hex')
    };
  }

  exonerate () {

  }

  finalize () {

  }

  sendTransactions = async (txs) => {
    try {
      let sidechain = this.ifc.sidechain;
      let res = await sidechain.sendTransactions(txs);
      return res.data;
    } catch (e) {
      console.error(e);
    }
  }

  commitTransactions = async () => {
    try {
      let sidechain = this.ifc.sidechain;
      let res = await sidechain.commitTransations();
      return res.data;
    } catch (e) {
      console.error(e);
    }
  }

  _computeTxHashAndCiphers = (rawTx) => {
    let crypto = this.ifc.crypto;
    let serializedRawTx = Buffer.from(JSON.stringify(rawTx)).toString('hex');
    let cipherUser = crypto.encrypt(serializedRawTx, rawTx.data.pkUser);
    let cipherCP = crypto.encrypt(serializedRawTx, rawTx.data.pkStakeholder);
    let txHash = EthUtils.sha3(cipherUser + cipherCP).toString('hex');
    return {
      txHash: txHash,
      ciphers: {
        cipherUser: cipherUser,
        cipherCP: cipherCP,
      }
    };
  }
}

export default Server;
