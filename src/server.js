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

  finalize = async (stageHeight) => {
    return this._infinitechain.booster.finalize(stageHeight);
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
