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

  signRawPayment = (rawPayment) => {
    assert(this._validateRawPayment(rawPayment), 'Wrong rawPayment format.');

    let stageHash = EthUtils.sha3(rawPayment.stageHeight.toString()).toString('hex');

    let paymentHashAndCiphers = this._computePaymentHashAndCiphers(rawPayment);
    let paymentHash = paymentHashAndCiphers.paymentHash;
    let ciphers = paymentHashAndCiphers.ciphers;

    let message = stageHash + paymentHash;
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
      stageHeight: rawPayment.stageHeight,
      stageHash: stageHash.toString('hex'),
      paymentHash: paymentHash.toString('hex'),
      cipherUser: ciphers.cipherUser,
      cipherCP: ciphers.cipherCP,
      v: signature.v,
      r: '0x' + signature.r.toString('hex'),
      s: '0x' + signature.s.toString('hex')
    };
  }

  sendPayments = async (payments) => {
    try {
      let url = this._nodeUrl + '/send/payments';
      let res = await axios.post(url, { payments: payments });
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  commitPayments = async () => {
    try {
      let url = this._nodeUrl + '/commit/payments';
      let res = await axios.post(url);
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  finalize = async (stageHeight) => {
    return await this.ifc.sidechain.finalize(stageHeight);
  }

  exonerate = async (stageHeight, paymentHash) => {
    try {
      let url = this._nodeUrl + '/exonerate';
      let res = await axios.post(url, { stage_height: stageHeight, payment_hash: paymentHash });
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  payPenalty = async (stageHeight, paymentHashes) => {
    try {
      let url = this._nodeUrl + '/payPenalty';
      let stageHash = '0x' + EthUtils.sha3(stageHeight.toString()).toString('hex');

      paymentHashes = paymentHashes.map((hash) => {
        return '0x' + hash;
      });

      let res = await axios.post(url, { stage_hash: stageHash, payment_hashes: paymentHashes });
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  _computePaymentHashAndCiphers = (rawPayment) => {
    let crypto = this.ifc.crypto;
    let serializedRawPayment = Buffer.from(JSON.stringify(rawPayment)).toString('hex');
    let cipherUser = crypto.encrypt(serializedRawPayment, rawPayment.data.pkUser);
    let cipherCP = crypto.encrypt(serializedRawPayment, rawPayment.data.pkStakeholder);
    let paymentHash = EthUtils.sha3(cipherUser + cipherCP).toString('hex');

    return {
      paymentHash: paymentHash,
      ciphers: {
        cipherUser: cipherUser,
        cipherCP: cipherCP,
      }
    };
  }

  _validateRawPayment = (rawPayment) => {
    if (!rawPayment.hasOwnProperty('from') ||
        !rawPayment.hasOwnProperty('to') ||
        !rawPayment.hasOwnProperty('value') ||
        !rawPayment.hasOwnProperty('localSequenceNumber') ||
        !rawPayment.hasOwnProperty('stageHeight') ||
        !rawPayment.hasOwnProperty('data')) {
      return false;
    }

    let data = rawPayment.data;

    if (!data.hasOwnProperty('pkUser') ||
        !data.hasOwnProperty('pkStakeholder')) {
      return false;
    }

    return true;
  }
}

export default Server;
