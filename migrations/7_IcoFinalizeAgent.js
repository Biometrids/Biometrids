const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const PreIcoFinalizeAgent = artifacts.require('PreIcoFinalizeAgent.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');

module.exports = async function (deployer) {
    let crowdSaleInstance = await CrowdSale.deployed();

    await deployer.deploy(IcoFinalizeAgent, CrowdSale.address, await crowdSaleInstance.refundVault());

    //Setup finalize agents
    await crowdSaleInstance.setPreIcoFinalizeAgent(PreIcoFinalizeAgent.address);
    await crowdSaleInstance.setIcoFinalizeAgent(IcoFinalizeAgent.address);

    let tokenInstance = await BiometridsToken.deployed();

    //Allocate 5% of tokens with decimals for the PreIco.
    const preIcoTokensAllowed = web3.toBigNumber('5000000').mul(
        web3.toBigNumber(10).pow(await tokenInstance.decimals())
    );
    await tokenInstance.approve(crowdSaleInstance.address, preIcoTokensAllowed);
};
