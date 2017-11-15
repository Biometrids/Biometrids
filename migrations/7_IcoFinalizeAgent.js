const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');

module.exports = async function (deployer) {
    let crowdSaleInstance = await CrowdSale.deployed();
    deployer.deploy(IcoFinalizeAgent, CrowdSale.address, await crowdSaleInstance.refundVault());
};
