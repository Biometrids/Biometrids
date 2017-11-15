const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    deployer.deploy(PreIcoPricingStrategy);
    deployer.link(PreIcoPricingStrategy, CrowdSale);
};
