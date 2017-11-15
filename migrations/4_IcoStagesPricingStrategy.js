const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');

module.exports = async function (deployer) {
    deployer.deploy(IcoStagesPricingStrategy);
    deployer.link(IcoStagesPricingStrategy, PreIcoFinalizeAgent);
};
