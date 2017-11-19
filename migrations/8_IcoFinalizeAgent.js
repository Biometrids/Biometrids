const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');

const web3 = CrowdSale.web3;

const initCrowdSale = require('./modules/initCrowdSale').default;

module.exports = async function (deployer) {
    let crowdSaleInstance = await CrowdSale.at(CrowdSale.address);

    await deployer.deploy(IcoFinalizeAgent, CrowdSale.address, await crowdSaleInstance.refundVault());

    let tokenInstance = await BiometridsToken.at(BiometridsToken.address);

    let pricingStrategyInstance = await IcoStagesPricingStrategy.deployed();

    let refundVaultInstance = await CrowdSaleRefundVault.deployed();

    await initCrowdSale(
        crowdSaleInstance,
        tokenInstance,
        pricingStrategyInstance,
        refundVaultInstance,
        PreIcoFinalizeAgent.address,
        IcoFinalizeAgent.address,
        web3
    );
};
