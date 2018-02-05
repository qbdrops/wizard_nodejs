class Level {
  constructor (db) {
    // Use level db
    this.db = db;
  }
  
  getPaymentsByStageHash = async (stageHash) => {
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
    this.db.put(key, JSON.stringify(value));
  }
}
    
export default Level;
  