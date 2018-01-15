class Event {
  constructor (eventConfig, ifc) {
    this.eventConfig = eventConfig;
    this.ifc = ifc;
    this._opt = {fromBlock: 0, toBlock: 'latest'};
  }

  watchAddNewStage (cb) {
    this.ifc.sidechain.getIFCContract()
      .then((IFCContract) => IFCContract.AddNewStage(this._opt).watch((err ,result) => {
        if(err) {console.trace;}
        cb(err,result);
      }))
      .catch(console.trace);
  }

  watchObjection (cb) {
    this.ifc.sidechain.getIFCContract()
      .then((IFCContract) => IFCContract.TakeObjection(this._opt).watch((err ,result) => {
        if(err) {console.trace;}
        cb(err,result);
      }))
      .catch(console.trace);
  }

  watchExonerate (cb) {
    this.ifc.sidechain.getIFCContract()
      .then((IFCContract) => IFCContract.Exonerate(this._opt).watch((err ,result) => {
        if(err) {console.trace;}
        cb(err,result);
      }))
      .catch(console.trace);
  }

  watchFinalize (cb) {
    this.ifc.sidechain.getIFCContract()
      .then((IFCContract) => IFCContract.Finalize(this._opt).watch((err ,result) => {
        if(err) {console.trace;}
        cb(err,result);
      }))
      .catch(console.trace);
  }
}

export default Event;
