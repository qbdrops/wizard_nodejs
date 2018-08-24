import types from '@/models/types';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._storage = eventConfig.storage;
    this._eventOpt = { toBlock: 'latest' };
    (async () => {
      this._fromBlock = await this._storage.getBlockNumber();
      this._address = '0x' + this._infinitechain.signer.getAddress().padStart(64, '0');
    })();
  }

  getProposeDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.getPastEvents('ProposeDeposit', {
      filter: { _client: this._address },
      fromBlock: 0,
      toBlock: 'latest'
    }, async (err, result) => {
      if (err) { console.trace; }
      let events = [];
      for (let i=0; i<result.length; i++) {
        let depositLog = await booster.methods.depositLogs(result[i].returnValues._dsn).call();
        if (depositLog.flag == false) {
          events.push(result[i]);
        }
      }
      cb(err, events);
      let web3 = this._infinitechain.contract.web3();
      web3.eth.getBlockNumber().then(blockNumber => {
        this._storage.setBlockNumber(blockNumber);
      })
    });
  }

  onProposeDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.events.ProposeDeposit({
      filter: { _client: this._address },
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDeposit (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.deposit },
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onProposeWithdrawal (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.withdrawal },
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onInstantWithdraw (cb) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.instantWithdrawal },
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onAttach (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Attach({
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onChallenge (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Challenge({
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onDefend (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Defend({
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  onFinalize (cb) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Finalize({
      toBlock: 'latest'
    }, (err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }
}

export default Event;
