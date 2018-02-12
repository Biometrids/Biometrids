export default async function initCrowdSale(
    crowdSaleInstance,
    tokenInstance,
    icoStagesPricingStrategyInstance,
    refundVaultInstance,
    icoFinalizeAgentAddress,
    web3
) {
    //Setup finalize agents
    await crowdSaleInstance.setIcoFinalizeAgent(icoFinalizeAgentAddress);

    //Setup refund vault
    await refundVaultInstance.allowAddress(icoFinalizeAgentAddress, true);
    await refundVaultInstance.allowAddress(crowdSaleInstance.address, true);

    //Allocate tokens with decimals for the Ico.
    const icoTokensAllowed = web3.toBigNumber('7e25');
    await tokenInstance.approve(crowdSaleInstance.address, icoTokensAllowed);

    await icoStagesPricingStrategyInstance.allowAddress(crowdSaleInstance.address, true);
};