import AuditStatus from '@/utils/AuditStatus';
import rsa from '@/utils/RSA';
import ifcEtherUtils from '@/utils/IFCEtherUtils';
import clientAudit from '@/utils/clientAudit';
import api from '@/api.js';

class RecordManager {
  constructor() {
    this._keyStore = {};
    this._cpPubkey = "";
    this._env = {};
  }

  /*
  This function is supposed to be used only for record which AuditStatus is NOT normal
  */

  set keyStore(s) {
    this._keyStore = s;
  }

  set cpPubkey(k) {
    this._cpPubkey = k;
  }

  set env(v) {
    this._env = v;
  }

  auditRecord = async (record) => {
    try {
      let rsaKey = await this._keyStore.getOrNewRSAKeyPair();
      let userPubKey = rsaKey.exportKey('public');
      let ciphertextUser = await rsa.encrypt(record.content, userPubKey);
      let ciphertextCp = await rsa.encrypt(record.content, this._cpPubkey);
      let sideChainAddress = await ifcEtherUtils.getBlockAddress(record.scidHash);
      if(sideChainAddress == '0x0000000000000000000000000000000000000000') {
        console.log('sidechain scidhash(' + record.scidHash + ')not deploy yet');
        record.auditStatus = AuditStatus.normal;
        return record;
      }

      let body = await this.getSlice(userPubKey, record.tid, record.scid);
      let slice = body.slice;
      let leafNodeHashSet = body.leafNodeHashSet;
      let rootHash = slice[slice.length - 1];

      let agentAudit = clientAudit.auditSlice(
        slice,
        leafNodeHashSet,
        {
          orderCipherUser: ciphertextUser,
          orderCipherCp: ciphertextCp
        }
      );

      let chainAudit = await ifcEtherUtils.checkRootHash(record.scidHash, rootHash);

      let result = null;

      if (agentAudit && chainAudit) {
        result = AuditStatus.success;
      } else {
        result = AuditStatus.error;
      }

      record.auditStatus = result;
      return record;
    } catch (e) {
      console.error(e);
    }
  }

  /*
    * This function is supposed to be used only for record which AuditStatus is error
    */
  watchSideChainEvent = async (record) => {
    try {
      console.log('watch event scid',record.scid);
      let eventSource = {
        scidHash: record.scidHash,
        handleEvent: record.handleEvent,
        opt: record.opt
      };
      ifcEtherUtils.watchSideChainEvent(eventSource);
      
    } catch (e) {
      console.error(e);
    }
  }

  getSlice = async (userPubKey, tid, scid) => {
    try {
        let res = await api.getSlice("hello", "signature", userPubKey, tid, scid);
        return res.body;
    } catch (e) {
        console.error(e);
    }
  }

  takeObjection = async (record) => {
    let txHash = await ifcEtherUtils.takeObjection(record);
    return txHash;
  }
}

let recordManager = new RecordManager();
export default recordManager;
