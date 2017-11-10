const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');

module.exports = async function (deployer) {
    deployer.deploy(PreIcoPricingStrategy);
};
