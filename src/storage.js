class Storage {
  constructor (db) {
    // Use level db
    this.db = db;
  }

  get = async (key) => {
    return await this.db.get(key);
  }

  set = async (key, value) => {
    return await this.db.put(key, value);
  }
}
  
export default Storage;
