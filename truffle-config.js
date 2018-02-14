require('babel-register');
require('babel-polyfill');

module.exports = {
    solc: {
        optimizer: {
            enabled: true,
            runs: 500
        }
    },
    networks: {
        development: {
            host: "localhost",
            port: 8444,
            network_id: "*", // Match any network id
            gas: "47e5",
            gasPrice: "21000000000"
        },
        live: {
            network_id: 1,
            host: "localhost",
            port: 8545,
            /**
             * From address should be changed
             */
            from: "0x38bdB4cA3E2837597bEb8d189dDd6b89704A4066",
            /**
             * Current default gas price.
             * Minimal could be 100000000 wei (confirm one transaction for 3 minutes)
             */
            gasPrice: "50000000000"
        }
    }
};
