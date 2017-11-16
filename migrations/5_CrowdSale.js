const CrowdSale = artifacts.require('CrowdSale.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');


module.exports = async function (deployer) {
    //todo Change wallet address. Should not be that same as contracts owner
    const walletAddress = '0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7';

    deployer.deploy(CrowdSale, BiometridsToken.address, walletAddress, PreIcoPricingStrategy.address);
    deployer.link(CrowdSale, [PreIcoFinalizeAgent, IcoFinalizeAgent]);
};
