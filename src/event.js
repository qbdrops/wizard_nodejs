class Event {
  constructor (eventConfig, ifc) {
    this.eventConfig = eventConfig;
    this.ifc = ifc;
    this._opt = {fromBlock: 0, toBlock: 'latest'};
  }

  watchAddNewStage (cb) {
    let IFCContract = this.ifc.sidechain.getIFCContract();

    IFCContract.AddNewStage(this._opt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  watchObjection (cb) {
    let IFCContract = this.ifc.sidechain.getIFCContract();

    IFCContract.TakeObjection(this._opt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  watchExonerate (cb) {
    let IFCContract = this.ifc.sidechain.getIFCContract();

    IFCContract.Exonerate(this._opt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }

  watchFinalize (cb) {
    let IFCContract = this.ifc.sidechain.getIFCContract();

    IFCContract.Finalize(this._opt).watch((err, result) => {
      if (err) { console.trace; }
      cb(err, result);
    });
  }
}

export default Event;
