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

  initialize = async () => {
    await this.contract.fetchSidechain();
  }
}

export default Infinitechain;
