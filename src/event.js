import types from '@/models/types';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._eventOpt = { toBlock: 'latest' };
  }

  onProposeDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.ProposeDeposit(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.VerifyReceipt({ _type: types.deposit }, this._eventOpt).watch(async (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onProposeWithdrawal (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.VerifyReceipt({ _type: types.withdrawal }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onInstantWithdraw (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.VerifyReceipt({ _type: types.instantWithdrawal }, this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onAttach (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.Attach(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onChallenge (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.Challenge(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDefend (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.Defend(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onFinalize (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.Finalize(this._eventOpt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }
}

export default Event;
