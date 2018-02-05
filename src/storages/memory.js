class Memory {
  constructor () {
    this.payments = {};
    this.rawPayments = {};
  }

  getPaymentsByStageHash = async (stageHash) => {
    return Object.keys(this.payments).map(key => {
      return this.payments[key];
    }).filter(payment => {
      return payment.stageHash == stageHash;
    }).map(payment => payment.paymentHash);
  }

  getRawPayment = async (key) => {
    let result = this.rawPayments[key];
    return result;
  }

  setRawPayment = async (key, value) => {
    this.rawPayments[key] = value;
  }

  getPayment = async (key) => {
    let result = this.payments[key];
    return result;
  }

  setPayment = async (key, value) => {
    this.payments[key] = value;
  }
}

export default Memory;
