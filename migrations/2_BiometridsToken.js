const BiometridsToken = artifacts.require('BiometridsToken.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    deployer.deploy(BiometridsToken);
    deployer.link(BiometridsToken, CrowdSale);
};
