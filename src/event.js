import types from '@/models/types';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._storage = eventConfig.storage;
    this._eventOpt = { toBlock: 'latest' };
    (async () => {
      let fromBlock = await this._storage.getBlockNumber();
      this._eventGetOpt = { fromBlock: fromBlock, toBlock: 'latest' };
      this.address = '0x' + this._infinitechain.signer.getAddress().padStart(64, '0');
    })();
  }

  getProposeDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.ProposeDeposit({ _client: this.address }, this._eventGetOpt).get((err, result) => {
      if (err) { console.trace; }
      let events = [];
      result.forEach((event) => {
        let depositLog = booster.depositLogs(event.args._dsn);
        if (depositLog[4] == false) {
          events.push(event);
        }
      });
      cb(err, events);
      let web3 = this._infinitechain.contract.web3();
      this._storage.setBlockNumber(web3.eth.blockNumber);
    });
  }

  onProposeDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.ProposeDeposit({ _client: this.address }, this._eventOpt).watch((err, result) => {
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
