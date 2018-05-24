import EthUtils from 'ethereumjs-util';
import axios from 'axios';
import types from '@/models/types';

class Server {
  constructor (serverConfig, infinitechain) {
    this.serverConfig = serverConfig;
    this._infinitechain = infinitechain;
    this._web3Url = serverConfig.web3Url;
    this._nodeUrl = serverConfig.nodeUrl;
  }

  sendLightTx = async (lightTx) => {
    let gringotts = this._infinitechain.gringotts;
    let contract = this._infinitechain.contract;
    let signer = this._infinitechain.signer;
    let receipt = await gringotts.sendLightTx(lightTx);
    receipt = signer.signWithServerKey(receipt);

    switch (receipt.type()) {
    case types.deposit:
      contract.deposit(receipt);
      break;
    case types.withdrawal:
      contract.proposeWithdrawal(receipt);
      break;
    case types.instantWithdrawal:
      contract.instantWithdraw(receipt);
      break;
    case types.remittance:
      break;
    }
    return receipt;
  }

  attach = async (stageHeight = null, nonce = null) => {
    let gringotts = this._infinitechain.gringotts;
    let res = await gringotts.fetchRootHashes(stageHeight);

    if (res.data.ok) {
      let serializedTx = this._infinitechain.contract.attach(
        res.data.trees.receiptRootHash,
        res.data.trees.accountRootHash,
        '',
        nonce
      );
      let attachRes = await gringotts.attach(serializedTx, res.data.stageHeight);
      return attachRes.data.txHash;
    } else {
      throw new Error(res.data.message);
    }
  }

  pendingRootHashes = async () => {
    try {
      let url = this._nodeUrl + '/pending/roothashes';
      let res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.log(e);
    }
  }

  finalize = async (stageHeight) => {
    return this._infinitechain.sidechain.finalize(stageHeight);
  }

  exonerate = async (stageHeight, paymentHash) => {
    let url = this._nodeUrl + '/slice';
    let res = await axios.get(url, {
      params: {
        stage_height: stageHeight, payment_hash: paymentHash
      }
    });

    let slice = res.data.slice;
    slice = slice.map(h => h.treeNodeHash);
    let collidingPaymentHashes = res.data.paymentHashArray;
    let treeNodeIndex = res.data.treeNodeIndex;

    return this._infinitechain.sidechain.exonerate(stageHeight, paymentHash, treeNodeIndex, slice, collidingPaymentHashes);
  }

  payPenalty = async (stageHeight, paymentHashes) => {
    return this._infinitechain.sidechain.payPenalty(stageHeight, paymentHashes);
  }

  _computePaymentHashAndCiphers = (rawPayment) => {
    let crypto = this._infinitechain.crypto;
    let serializedRawPayment = Buffer.from(JSON.stringify(rawPayment)).toString('hex');
    let cipherClient = crypto.encrypt(serializedRawPayment, rawPayment.data.pkClient);
    let cipherStakeholder = crypto.encrypt(serializedRawPayment, rawPayment.data.pkStakeholder);
    let paymentHash = EthUtils.sha3(cipherClient + cipherStakeholder).toString('hex');

    return {
      paymentHash: paymentHash,
      ciphers: {
        cipherClient: cipherClient,
        cipherStakeholder: cipherStakeholder,
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

    if (!data.hasOwnProperty('pkClient') ||
        !data.hasOwnProperty('pkStakeholder')) {
      return false;
    }

    return true;
  }
}

export default Server;
