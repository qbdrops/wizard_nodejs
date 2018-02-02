import level from 'level';

class Storage {
  constructor () {
    this.db = level('./db');
  }

  get = async (key) => {
    return await this.db.get(key);
  }

  set = async (key, value) => {
    return await this.db.put(key, value);
  }
}
  
export default Storage;
