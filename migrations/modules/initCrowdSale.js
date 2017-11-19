export default async function initCrowdSale(
    crowdSaleInstance,
    tokenInstance,
    icoStagesPricingStrategyInstance,
    refundVaultInstance,
    preIcoFinalizeAgentAddress,
    icoFinalizeAgentAddress,
    web3
) {
    //Setup finalize agents
    await crowdSaleInstance.setPreIcoFinalizeAgent(preIcoFinalizeAgentAddress);
    await crowdSaleInstance.setIcoFinalizeAgent(icoFinalizeAgentAddress);
    await crowdSaleInstance.allowAddress(preIcoFinalizeAgentAddress, true);

    //Setup refund vault
    await refundVaultInstance.allowAddress(icoFinalizeAgentAddress, true);
    await refundVaultInstance.allowAddress(crowdSaleInstance.address, true);

    //Allocate 5% of tokens with decimals for the PreIco.
    const preIcoTokensAllowed = web3.toBigNumber('5000000').mul(
        web3.toBigNumber(10).pow(await tokenInstance.decimals())
    );
    await tokenInstance.approve(crowdSaleInstance.address, preIcoTokensAllowed);

    await icoStagesPricingStrategyInstance.allowAddress(crowdSaleInstance.address, true);
};