const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');

module.exports = async function (deployer) {
    deployer.deploy(PreIcoFinalizeAgent, CrowdSale.address, IcoStagesPricingStrategy.address);
};
