const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');

module.exports = async function (deployer) {
    deployer.deploy(IcoStagesPricingStrategy);
};
