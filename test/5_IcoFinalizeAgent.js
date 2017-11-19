const IcoFinalizeAgentTest = artifacts.require('./mocks/IcoFinalizeAgentTest.sol');
const CrowdSalePreIcoFinalizeAgentTest = artifacts.require('./mocks/CrowdSalePreIcoFinalizeAgentTest.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const BiometridsToken = artifacts.require('BiometridsToken.sol');
const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');

async function deployCrowdSale(token, wallet, pricingStrategy) {
    return CrowdSalePreIcoFinalizeAgentTest.new(token, wallet, pricingStrategy);
}

async function deployFinalizeAgent(crowdSale, wallet) {
    return IcoFinalizeAgentTest.new(crowdSale, wallet);
}

async function deployIcoStagesPricingStrategy() {
    return IcoStagesPricingStrategy.new();
}

async function deployToken() {
    return BiometridsToken.new();
}

contract('IcoFinalizeAgentTest', function (accounts) {
    let finalizeAgentInstance;
    let crowdSaleInstance;
    let icoPricingStrategyInstance;
    let tokenInstance;
    let refundVaultInstance;

    const wallet = accounts[5];

    const refundVaultStates = {
        'Active': 0,
        'Refunding': 1,
        'Closed': 2
    };

    beforeEach(async () => {
        tokenInstance = await deployToken();
        assert.ok(tokenInstance);

        icoPricingStrategyInstance = await deployIcoStagesPricingStrategy();
        assert.ok(icoPricingStrategyInstance);

        crowdSaleInstance =
            await deployCrowdSale(
                tokenInstance.address,
                wallet,
                icoPricingStrategyInstance.address
            );
        assert.ok(crowdSaleInstance);

        finalizeAgentInstance = await deployFinalizeAgent(crowdSaleInstance.address, wallet);
        assert.ok(finalizeAgentInstance);

        refundVaultInstance = await CrowdSaleRefundVault.at(
            await finalizeAgentInstance.refundVault()
        );
    });

    it('Check that the refund vault in refunding state if soft cap was NOT reached', async function () {
        try {
            await finalizeAgentInstance.finalize();

            assert.equal(
                await refundVaultInstance.state(),
                refundVaultStates['Refunding']
            )
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check that the refund vault in closed state if soft cap was reached', async function () {
        try {
            await crowdSaleInstance.setSoftCapFlag(true);
            await finalizeAgentInstance.finalize();

            assert.equal(
                await refundVaultInstance.state(),
                refundVaultStates['Closed']
            )
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
