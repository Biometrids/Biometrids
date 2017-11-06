const BiometridsToken = artifacts.require('BiometridsToken.sol');

module.exports = async function (deployer) {
    deployer.deploy(BiometridsToken);
};
