const CrowdSale = artifacts.require('CrowdSale.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');


module.exports = async function (deployer) {
    //todo Change wallet address. Should not be that same as contracts owner
    const walletAddress = '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204';

    deployer.deploy(CrowdSale, BiometridsToken.address, walletAddress, PreIcoPricingStrategy.address);
    deployer.link(CrowdSale, PreIcoFinalizeAgent);
    deployer.link(CrowdSale, IcoFinalizeAgent);
};
