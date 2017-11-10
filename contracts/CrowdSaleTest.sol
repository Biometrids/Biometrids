pragma solidity 0.4.18;


import "./BaseCrowdSale.sol";


/**
 * @notice This is only mock for actual crowdsale. Used for testing finalize agents. Will be implemented in future/
 */
contract CrowdSaleTest is BaseCrowdSale {
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) public {
        pricingStrategy = _pricingStrategy;
        require(pricingStrategy.isPricingStrategy());
    }

    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) public {}

    function setICOFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) public {}

    function invest() public {}

    function startPreIco() public {}

    function finalizePreIco() public {}

    function startIco() public {}

    function finalizeIco() public {}
}
