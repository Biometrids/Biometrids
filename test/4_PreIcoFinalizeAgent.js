const PreIcoFinalizeAgentTest = artifacts.require('./mocks/PreIcoFinalizeAgentTest.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const PreIcoPricingStrategy = artifacts.require('PreIcoPricingStrategy.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');

async function deployCrowdSale(token, wallet, pricingStrategy) {
    return CrowdSale.new(token, wallet, pricingStrategy);
}

async function deployFinalizeAgent(crowdSale, pricingStrategy) {
    return PreIcoFinalizeAgentTest.new(crowdSale, pricingStrategy);
}

async function deployIcoStagesPricingStrategy() {
    return IcoStagesPricingStrategy.new();
}

async function deployPreIcoPricingStrategy() {
    return PreIcoPricingStrategy.new();
}

async function deployToken() {
    return BiometridsToken.new();
}

contract('IcoFinalizeAgentTest', function (accounts) {
    let finalizeAgentInstance;
    let crowdSaleInstance;
    let icoPricingStrategyInstance;
    let preIcoPricingStrategyInstance;
    let tokenInstance;

    const wallet = accounts[5];

    beforeEach(async () => {
        tokenInstance = await deployToken();
        assert.ok(tokenInstance);

        preIcoPricingStrategyInstance = await deployPreIcoPricingStrategy();
        assert.ok(preIcoPricingStrategyInstance);

        crowdSaleInstance =
            await deployCrowdSale(
                tokenInstance.address,
                wallet,
                preIcoPricingStrategyInstance.address
            );
        assert.ok(crowdSaleInstance);

        icoPricingStrategyInstance = await deployIcoStagesPricingStrategy();
        assert.ok(icoPricingStrategyInstance);

        finalizeAgentInstance = await deployFinalizeAgent(crowdSaleInstance.address, icoPricingStrategyInstance.address);
        assert.ok(finalizeAgentInstance);

        //Add finalize agent to the whitelist
        await crowdSaleInstance.allowAddress(finalizeAgentInstance.address, true);
    });

    it('Check that the pricing strategy was correctly set after call finalize method', async function () {
        try {
            await finalizeAgentInstance.finalize();
            assert.equal(
                await crowdSaleInstance.pricingStrategy(),
                icoPricingStrategyInstance.address
            );
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check finalize agent interface', async function () {
        try {
            assert.isTrue(
                await finalizeAgentInstance.isFinalizeAgent()
            );
        } catch (err) {
            assert(false, err.message);
        }
    })
});
