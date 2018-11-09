import axios from 'axios';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import types from '@/models/types';

class Server {
  constructor (serverConfig, infinitechain) {
    this.serverConfig = serverConfig;
    this._infinitechain = infinitechain;
    this._web3Url = serverConfig.web3Url;
    this._nodeUrl = serverConfig.nodeUrl;
  }

  addServerMetadata = (lightTx, serverMetadata) => {
    if (serverMetadata) {
      if (typeof serverMetadata == 'object') {
        serverMetadata = JSON.stringify(serverMetadata);
      } else {
        serverMetadata = serverMetadata.toString();
      }
      lightTx.metadata.server = serverMetadata;
    } else {
      lightTx.metadata.server = '';
    }
    return lightTx;
  }

  signLightTx = (lightTx, privateKey = null) => {
    if (typeof lightTx == 'string') lightTx == JSON.parse(lightTx);
    lightTx = this.addServerMetadata(lightTx, lightTx.metadata.server);
    lightTx = new LightTransaction(lightTx);
    // Sign lightTx
    let signer = this._infinitechain.signer;
    let signedLightTx = signer.signWithServerKey(lightTx, privateKey);

    return signedLightTx;
  }

  sendLightTx = async (lightTx) => {
    let gringotts = this._infinitechain.gringotts;
    let verifier = this._infinitechain.verifier;
    let receipt = await gringotts.sendLightTx(lightTx);
    assert(verifier.verifyReceipt(receipt), 'Wrong signature when verify receipt received from booster.');
    return receipt;
  }

  sendReceipt = async (receipt, privateKey = null) => {
    let contract = this._infinitechain.contract;
    let txHash = '';
    let isTxFinished = false;
    return new Promise(async (resolve, reject) => {
      try {
        let normalizedReceipt = new Receipt(receipt);
        switch (normalizedReceipt.type()) {
          case types.deposit:
            txHash = await contract.deposit(normalizedReceipt, privateKey);
            break;
          case types.withdrawal:
            txHash = await contract.proposeWithdrawal(normalizedReceipt, privateKey);
            break;
          case types.instantWithdrawal:
            txHash = await contract.instantWithdraw(normalizedReceipt, privateKey);
            break;
          case types.remittance:
            return resolve(txHash);
        }
        isTxFinished = await contract.isTxFinished(txHash);
        if (isTxFinished) return resolve(txHash);
        else return reject('txHash status 0x0');
      } catch (e) {
        return reject(e);
      }
    });
  }

  defend = async (stageHeight, lightTxHash) => {
    let url = this._nodeUrl + '/slice';
    let res = await axios.get(url, {
      params: {
        stage_height: stageHeight, payment_hash: lightTxHash
      }
    });

    let slice = res.data.slice;
    slice = slice.map(h => h.treeNodeHash);
    let collidingLightTxHashes = res.data.lightTxHashArray;
    let treeNodeIndex = res.data.treeNodeIndex;

    return this._infinitechain.booster.exonerate(stageHeight, lightTxHash, treeNodeIndex, slice, collidingLightTxHashes);
  }

  compensate = async (stageHeight, lightTxHashes) => {
    return this._infinitechain.booster.payPenalty(stageHeight, lightTxHashes);
  }
}

export default Server;
