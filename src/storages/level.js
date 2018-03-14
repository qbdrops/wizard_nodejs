class Level {
  constructor (db) {
    // Use level db
    this.db = db;
  }

  getPaymentHashesByStageHash = async (stageHash) => {
    let result;
    try {
      result = await this.db.get(stageHash);
    } catch (e) {
      result = JSON.stringify([]);
    } finally {
      result = JSON.parse(result);
    }
    return result;
  }

  getRawPayment = async (key) => {
    let result = await this.db.get('raw:' + key);
    return JSON.parse(result);
  }

  setRawPayment = async (key, value) => {
    this.db.put('raw:' + key, JSON.stringify(value));
  }

  getPayment = async (key) => {
    let result = await this.db.get(key);
    return JSON.parse(result);
  }

  setPayment = async (key, value) => {
    try {
      this.db.put(key, JSON.stringify(value));
      this._appendPaymentHash(value.stageHash, value.paymentHash);
    } catch (e) {
      console.log(e);
    }
  }

  _appendPaymentHash = async (stageHash, paymentHash) => {
    let paymentHashes;
    try {
      paymentHashes = await this.db.get(stageHash);
    } catch (e) {
      paymentHashes = JSON.stringify([paymentHash]);
    } finally {
      paymentHashes = JSON.parse(paymentHashes);
      paymentHashes.push(paymentHash);
      this.db.put(stageHash, JSON.stringify(paymentHashes));
    }
  }
}

export default Level;
