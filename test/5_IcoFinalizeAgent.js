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

async function deployRefundVault(wallet) {
    return CrowdSaleRefundVault.new(wallet);
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

        refundVaultInstance = await deployRefundVault(wallet);
        assert.ok(refundVaultInstance);

        crowdSaleInstance =
            await deployCrowdSale(
                tokenInstance.address,
                refundVaultInstance.address,
                icoPricingStrategyInstance.address
            );
        assert.ok(crowdSaleInstance);

        finalizeAgentInstance = await deployFinalizeAgent(crowdSaleInstance.address, refundVaultInstance.address);
        assert.ok(finalizeAgentInstance);

        await refundVaultInstance.allowAddress(finalizeAgentInstance.address, true);
        await refundVaultInstance.allowAddress(crowdSaleInstance.address, true);
    });

    it('Check that the refund vault in refunding state if soft cap was NOT reached', async function () {
        try {
            await finalizeAgentInstance.finalize();

            assert.equal(
                (await refundVaultInstance.state()).toString(),
                refundVaultStates['Refunding']
            );

        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check that the refund vault in closed state if soft cap was reached', async function () {
        try {
            await crowdSaleInstance.setSoftCapFlag(true);
            await finalizeAgentInstance.finalize();

            assert.equal(
                (await refundVaultInstance.state()).toString(),
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
