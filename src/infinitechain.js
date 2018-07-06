class Infinitechain {
  setClient (client) {
    this.client = client;
  }

  setServer (server) {
    this.server = server;
  }

  setSigner (signer) {
    this.signer = signer;
  }

  setEvent (event) {
    this.event = event;
  }

  setContract (contract) {
    this.contract = contract;
  }

  setGringotts (gringotts) {
    this.gringotts = gringotts;
  }

  setVerifier (verifier) {
    this.verifier = verifier;
  }

  setAuditor (auditor) {
    this.auditor = auditor;
  }

  initialize = async () => {
    await this.contract.fetchBooster();
    await this.verifier.fetchServerAddress();
  }
}

export default Infinitechain;
