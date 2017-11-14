pragma solidity 0.4.18;


import "../CrowdSale.sol";


/**
 * @notice This is only mock for actual crowdsale. Used for testing finalize agents. Will be implemented in future/
 */
contract CrowdSalePreIcoFinalizeAgentTest is CrowdSale {
    bool reachedSoftCap = false;

    function CrowdSalePreIcoFinalizeAgentTest(
    TokenInterface _token,
    RefundVaultInterface _refundVault,
    PricingStrategyInterface _pricingStrategy
    ) CrowdSale(_token, _refundVault, _pricingStrategy) public {}

    function setSoftCapFlag(bool _softCapFlag) public {
        reachedSoftCap = _softCapFlag;
    }

    function isReachedSoftCap() public constant returns (bool) {
        return reachedSoftCap;
    }
}

