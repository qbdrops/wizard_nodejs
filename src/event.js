import types from '@/models/types';
import Receipt from '@/models/receipt';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._eventOpt = { toBlock: 'latest' };
  }

  onProposeDeposit (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.Propose({ _type: types.deposit }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onProposeWithdrawal (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.Propose({ _type: types.withdrawal }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDeposit (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.VerifyReceipt({ _type: types.deposit }, this._eventOpt).watch(async (err, result) => {
      if (err) { console.trace; }

      // Save receipt
      let targetLightTxHash = result.args._lightTxHash.substring(2);
      let lightTx = await this._infinitechain.client.getLightTx(targetLightTxHash);
      let clientLightTxSig = lightTx.sig.clientLightTx;
      let serverLightTxSig = {
        v: result.args._sig_lightTx[0],
        r: result.args._sig_lightTx[1],
        s: result.args._sig_lightTx[2],
      };
      let serverReceiptSig = {
        v: result.args._sig_receipt[0],
        r: result.args._sig_receipt[1],
        s: result.args._sig_receipt[2],
      };

      let receiptJson = {
        lightTxHash: lightTx.lightTxHash,
        lightTxData: lightTx.lightTxData,
        sig: {
          clientLightTx: clientLightTxSig,
          serverLightTx: serverLightTxSig,
          serverReceipt: serverReceiptSig,
        },
        receiptData: {
          stageHeight: result.args._stageHeight,
          GSN: result.args._gsn,
          lightTxHash: result.args._lightTxHash.substring(2),
          fromBalance: result.args._fromBalance,
          toBalance: result.args._toBalance
        }
      };

      let receipt = new Receipt(receiptJson);
      await this._infinitechain.client.saveReceipt(receipt);

      cb(err, receipt);
    });
  }

  onConfirmWithdrawal (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.VerifyReceipt({ _type: types.withdrawal }, this._eventOpt).watch(async (err, result) => {
      if (err) { console.trace; }

      // Save receipt
      let targetLightTxHash = result.args._lightTxHash.substring(2);
      let lightTx = await this._infinitechain.client.getLightTx(targetLightTxHash);
      let clientLightTxSig = lightTx.sig.clientLightTx;
      let serverLightTxSig = {
        v: result.args._sig_lightTx[0],
        r: result.args._sig_lightTx[1],
        s: result.args._sig_lightTx[2],
      };
      let serverReceiptSig = {
        v: result.args._sig_receipt[0],
        r: result.args._sig_receipt[1],
        s: result.args._sig_receipt[2],
      };

      let receiptJson = {
        lightTxHash: lightTx.lightTxHash,
        lightTxData: lightTx.lightTxData,
        sig: {
          clientLightTx: clientLightTxSig,
          serverLightTx: serverLightTxSig,
          serverReceipt: serverReceiptSig,
        },
        receiptData: {
          stageHeight: result.args._stageHeight,
          GSN: result.args._gsn,
          lightTxHash: result.args._lightTxHash.substring(2),
          fromBalance: result.args._fromBalance,
          toBalance: result.args._toBalance
        }
      };

      let receipt = new Receipt(receiptJson);
      await this._infinitechain.client.saveReceipt(receipt);

      cb(err, receipt);
    });
  }

  onInstantWithdraw (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.VerifyReceipt({ _type: types.instantWithdrawal }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onAttach (cb) {
    let sidechain = this._infinitechain.contract.sidechain();

    sidechain.Attach(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onChallenge (cb) {
    let sidechain = this._infinitechain.contract.sidechain();

    sidechain.Challenge(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDefend (cb) {
    let sidechain = this._infinitechain.contract.sidechain();

    sidechain.Defend(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onFinalize (cb) {
    let sidechain = this._infinitechain.contract.sidechain();

    sidechain.Finalize(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }
}

export default Event;
