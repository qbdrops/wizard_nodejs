class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._eventOpt = { fromBlock: 0, toBlock: 'latest' };
  }

  onProposeDeposit (cb) {
    let sidechain = this._infinitechain.contract.sidechain();
    sidechain.ProposeDeposit(this._eventOpt).watch((err, result) => {
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
