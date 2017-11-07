module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8444,
      network_id: "*", // Match any network id
      gas: 0xfffffffffff
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  }
};
