import auditStatus from '@/utils/AuditStatus';

let memory = {};
global.memory = memory;

class RecordStorage {
  constructor() {
    this._keyStore = {};
    this._env = {};
  }

  set keyStore(s) {
    this._keyStore = s;
  }

  set env(v) {
    this._env = v;
  }

  removeData () {
    return new Promise((resolve, reject) => {
      if (this._keyStore.isEnableStorage()) {
        this._keyStore.getChromeInstance().storage.local.get(null, (items) => {
          if (this._keyStore.getChromeInstance().runtime.lastError) {
            console.log(this._keyStore.getChromeInstance().runtime.lastError);
            reject(false);
          }

          let o = {};
          for (let key in items) {
            if (!key.startsWith('TID-')) {
              o[key]=items[key];
            }
          }
          //console.log('reserved data',o);
          this._keyStore.getChromeInstance().storage.local.clear(function(){});
          this._keyStore.getChromeInstance().storage.local.set(o);
          resolve(true);
        });
      } else if (this._env.debug) {
        memory = {}
      } else {
        console.log('Please enable storage permission');
        reject(false);
      }
    });
  }

  getRecords () {
    return new Promise((resolve, reject) => {
      if (this._keyStore.isEnableStorage()) {
        this._keyStore.getChromeInstance().storage.local.get(null, (items) => {
          if (this._keyStore.getChromeInstance().runtime.lastError) {
            reject(this._keyStore.getChromeInstance().runtime.lastError);
          }

          //console.log('getRecords', items);
          let data = [];
          for (let key in items) {
            if (key.startsWith('TID-')) {
              items[key].detail = JSON.parse(Buffer.from(items[key].content, 'hex').toString());
              data.push(items[key]);
            }
          }
          resolve(data);
        });

      } else if (this._env.debug) {
        let data = [];
        for (let key in memory) {
          if (key.startsWith('TID-')) {
            memory[key].detail = JSON.parse(Buffer.from(memory[key].content, 'hex').toString());
            data.push(memory[key]);
          }
        }
        resolve(data);
      } else {
        reject('Please enable storage permission');
      }
    });
  }

  saveRecord (record) {
    return new Promise((resolve, reject) => {
      let tid = 'TID-' + record.tid;
      if (this._keyStore.isEnableStorage()) {
        let o = {}
        if (!record.auditStatus) {
          record.auditStatus = auditStatus.normal
        }
        o[tid] = record;
        this._keyStore.getChromeInstance().storage.local.set(o);
        resolve(true);
  
      } else if (this._env.debug) {
        if (!record.auditStatus) {
          record.auditStatus = auditStatus.normal
        }
        memory[tid] = record;
        resolve(true);
      }
  
      reject('No storage available.');
    });
  }
}

let recordStorage = new RecordStorage();
export default recordStorage;
