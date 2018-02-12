const CrowdSale = artifacts.require('CrowdSale.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');

module.exports = async function (deployer) {
    deployer.deploy(CrowdSale, BiometridsToken.address, CrowdSaleRefundVault.address, IcoStagesPricingStrategy.address);
    deployer.link(CrowdSale, IcoFinalizeAgent);
};
