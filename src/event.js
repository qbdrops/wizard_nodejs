import Util from '@/utils/util';
import types from '@/models/types';

class Event {
  constructor (eventConfig, infinitechain) {
    this.eventConfig = eventConfig;
    this._infinitechain = infinitechain;
    this._storage = eventConfig.storage;
    (async () => {
      this._fromBlock = await this._storage.getBlockNumber();
    })();
  }

  getProposeDeposit (cb, address = null) {
    let client = address? address : this._infinitechain.signer.getAddress();
    let booster = this._infinitechain.contract.booster();
    booster.getPastEvents('ProposeDeposit', {
      filter: { _client: '0x' + Util.toByte32(client) },
      fromBlock: 0,
      toBlock: 'latest'
    }, async (err, result) => {
      let events = [];
      if (result) {
        for (let i = 0; i < result.length; i++) {
          let depositLog = await booster.methods.depositLogs(result[i].returnValues._dsn).call();
          if (depositLog.flag == false) {
            events.push(result[i]);
          }
        }
        let web3 = this._infinitechain.contract.web3();
        web3.eth.getBlockNumber().then(this._storage.setBlockNumber);
      }
      cb(err, events);
    });
  }

  onProposeDeposit (cb, address = null) {
    let client = address? address : this._infinitechain.signer.getAddress();
    let booster = this._infinitechain.contract.booster();
    booster.events.ProposeDeposit({
      filter: { _client: '0x' + Util.toByte32(client) },
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onDeposit (cb, address = null) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.deposit },
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onProposeWithdrawal (cb, address = null) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.withdrawal },
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onWithdraw (cb, address = null) {
    let client = address? address : this._infinitechain.signer.getAddress();
    let booster = this._infinitechain.contract.booster();
    booster.events.Withdraw({
      filter: { _client: '0x' + Util.toByte32(client) },
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onInstantWithdraw (cb, address = null) {
    let booster = this._infinitechain.contract.booster();
    booster.events.VerifyReceipt({
      filter: { _type: types.instantWithdrawal },
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onAttach (cb, address = null) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Attach({
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onChallenge (cb, address = null) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Challenge({
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onDefend (cb, address = null) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Defend({
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }

  onFinalize (cb, address = null) {
    let booster = this._infinitechain.contract.booster();

    booster.events.Finalize({
      toBlock: 'latest'
    }, (err, result) => {
      cb(err, result);
    });
  }
}

export default Event;
