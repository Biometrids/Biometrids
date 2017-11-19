const CrowdSale = artifacts.require('CrowdSale.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');

module.exports = async function (deployer) {
    deployer.deploy(CrowdSale, BiometridsToken.address, CrowdSaleRefundVault.address, PreIcoPricingStrategy.address);
    deployer.link(CrowdSale, [PreIcoFinalizeAgent, IcoFinalizeAgent]);
};
