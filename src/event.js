import types from '@/models/types';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._eventOpt = { toBlock: 'latest' };
  }

  onProposeDeposit (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.ProposeDeposit(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDeposit (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.VerifyReceipt({ _type: types.deposit }, this._eventOpt).watch(async (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onProposeWithdrawal (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.VerifyReceipt({ _type: types.withdrawal }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
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
