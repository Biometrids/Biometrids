const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');

module.exports = async function (deployer) {
    deployer.deploy(IcoStagesPricingStrategy);
    deployer.link(IcoStagesPricingStrategy, IcoFinalizeAgent);
};
