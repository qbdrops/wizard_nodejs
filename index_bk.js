import recordStorage from '@/utils/RecordStorage';
import recordManager from '@/utils/RecordManager';
import auditStatus from '@/utils/AuditStatus';
import rsa from '@/utils/RSA';
import ifcEtherUtils from '@/utils/IFCEtherUtils';
import clientAudit from '@/utils/clientAudit';
import { calcLeafIndex } from '@/utils/debugTools';
import api from '@/api';
import IFC from '@/abi/IFC';
import SideChain from '@/abi/SideChainBlock';

module.exports = {
  recordStorage: recordStorage,
  recordManager: recordManager,
  auditStatus: auditStatus,
  rsa: rsa,
  ifcEtherUtils: ifcEtherUtils,
  clientAudit: clientAudit,
  calcLeafIndex: calcLeafIndex,
  api: api,
  abi: {
    ifc: IFC,
    sideChain: SideChain
  }
};
