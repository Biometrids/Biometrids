## Install project dependencies
1. Install nodejs and npm
2. Install project dependencies: `npm install`

##Start truffle develop mode
`npm run develop`  

## Run testrpc (do it in a separate bash session). You will need this one before you start testing.
`sh testrpc.sh` or `./node_modules/.bin/testrpc`   
(in the first case you will get predefined set of accounts suitable for the all test case)

## Run full test suite
`npm run test`

## Run specified test
`./node_modules/.bin/truffle test ./test/5_CrowdSaleRefundVault.js`
  
## Compile the smart contracts
`npm run compile`    

## Software versions
Solidity v0.4.15  
Truffle v3.4.11  
OpenZeppelin 1.3.0      

## Deployment price
Gas usage: TBD
Price in wei: TBD
Price in ether: TBD
