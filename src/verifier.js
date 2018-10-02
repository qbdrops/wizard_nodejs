import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import types from '@/models/types';

class Verifier {
  constructor (verifierConfig, infinitechain) {
    this.verifierConfig = verifierConfig;
    this._infinitechain = infinitechain;
    this._serverAddress = null;
  }

  fetchServerAddress = async () => {
    let res = await this._infinitechain.gringotts.fetchServerAddress();
    this._serverAddress = res.data.address;
  }

  verifyLightTx = (lightTx) => {
    assert(lightTx instanceof LightTransaction, 'Parameter \'lightTx\' is not a LightTransaction instance.');
    return this._verify(lightTx);
  }

  verifyReceipt = (receipt) => {
    assert(receipt instanceof Receipt, 'Parameter \'receipt\' is not a Receipt instance.');
    return this._verify(receipt);
  }

  _verify = (object) => {
    let isValid;
    let clientAddress;
    let klass;
    if (object instanceof LightTransaction) {
      klass = 'lightTx';
    } else if (object instanceof Receipt) {
      klass = 'receipt';
    } else {
      throw new Error('\'object\' should be instance of \'LightTransaction\' or \'Receipt\'.');
    }

    switch (object.type()) {
    case types.deposit:
      clientAddress = object.lightTxData.to.slice(-40);
      break;
    case types.withdrawal:
    case types.instantWithdrawal:
    case types.remittance:
      clientAddress = object.lightTxData.from.slice(-40);
      break;
    }
    let serverAddress = EthUtils.stripHexPrefix(this._serverAddress);
    let isClientLightTxSigValid = true;
    let isServerLightTxSigValid = true;
    let isBoosterReceiptSigValid = true;

    if (object.hasClientLightTxSig()) {
      isClientLightTxSigValid = (clientAddress == this._recover(object.lightTxHash, object.sig.clientLightTx));
    }

    if (object.hasServerLightTxSig()) {
      isServerLightTxSigValid = (serverAddress == this._recover(object.lightTxHash, object.sig.serverLightTx));
    }

    if (klass == 'receipt') {
      let boosterAccountAddress = EthUtils.stripHexPrefix(this._infinitechain.contract.boosterAccountAddress);
      if (object.hasBoosterReceiptSig()) {
        isBoosterReceiptSigValid = (boosterAccountAddress == this._recover(object.receiptHash, object.sig.boosterReceipt));
      }
    }

    isValid = (isClientLightTxSigValid && isServerLightTxSigValid && isBoosterReceiptSigValid);
    return isValid;
  }

  _recover = (msgHash, signature) => {
    let prefix = new Buffer('\x19Ethereum Signed Message:\n32');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, Buffer.from(msgHash, 'hex')]));
    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    let address = EthUtils.pubToAddress(publicKey).toString('hex');
    return address;
  }
}

export default Verifier;
