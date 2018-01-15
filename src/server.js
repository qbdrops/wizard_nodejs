import EthUtils from 'ethereumjs-util';
import axios from 'axios';
import assert from 'assert';

class Server {
  constructor (serverConfig, ifc) {
    this.serverConfig = serverConfig;
    this.ifc = ifc;

    assert(serverConfig.web3Url != undefined, 'Opt should include web3Url.');    
    assert(serverConfig.nodeUrl != undefined, 'Opt should include nodeUrl.');
    this._web3Url = serverConfig.web3Url;
    this._nodeUrl = serverConfig.nodeUrl;
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

  sendTransactions = async (txs) => {
    try {
      let url = this._nodeUrl + '/send/transactions';
      let res = await axios.post(url, { txs: txs });
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  commitTransactions = async () => {
    try {
      let url = this._nodeUrl + '/commit/transactions';
      let res = await axios.post(url);
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  exonerate () {
  }

  finalize = async (stageHeight) => {
    try {
      let url = this._nodeUrl + '/finalize';
      let stageHash = '0x' + EthUtils.sha3(stageHeight.toString()).toString('hex');
      let res = await axios.put(url, { stage_hash: stageHash });
      return res.data;
    } catch (e) {
      console.log(e);
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
