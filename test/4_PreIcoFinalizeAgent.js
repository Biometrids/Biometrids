const PreIcoFinalizeAgentTest = artifacts.require('PreIcoFinalizeAgentTest.sol');
const CrowdSaleTest = artifacts.require('CrowdSaleTest.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');

async function deployCrowdSale() {
    return CrowdSaleTest.new();
}

async function deployFinalizeAgent(crowdSale, pricingStrategy) {
    return PreIcoFinalizeAgentTest.new(crowdSale, pricingStrategy);
}

async function deployPricingStrategy() {
    return IcoStagesPricingStrategy.new();
}

contract('PreIcoFinalizeAgentTest', function (accounts) {
    let finalizeAgentInstance;
    let crowdSaleInstance;
    let pricingStrategyInstance;

    beforeEach(async () => {
        crowdSaleInstance = await deployCrowdSale();
        assert.ok(crowdSaleInstance);

        pricingStrategyInstance = await deployPricingStrategy();
        assert.ok(pricingStrategyInstance);

        finalizeAgentInstance = await deployFinalizeAgent(crowdSaleInstance.address, pricingStrategyInstance.address);
        assert.ok(finalizeAgentInstance);
    });

    it('Check that the pricing strategy was correctly set after call finalize method', async function () {
        try {
            await finalizeAgentInstance.finalize();
            assert.equal(
                await crowdSaleInstance.pricingStrategy(),
                pricingStrategyInstance.address
            );
        } catch (err) {
            assert(false, err.message)
        }
    });
});
