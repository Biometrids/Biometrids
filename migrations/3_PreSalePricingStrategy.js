const PreSalePricingStrategy = artifacts.require('PreSalePricingStrategy.sol');

module.exports = async function (deployer) {
    deployer.deploy(PreSalePricingStrategy);
};
