pragma solidity 0.4.18;


import "./interfaces/FinalizeAgentInterface.sol";
import "./interfaces/CrowdSaleInterface.sol";
import "./interfaces/PricingStrategyInterface.sol";


contract PreIcoFinalizeAgent is FinalizeAgentInterface {
    CrowdSaleInterface public crowdSale;

    PricingStrategyInterface public icoStagesPricingStrategy;

    modifier onlyCrowdSale() {
        require(crowdSale == msg.sender);
        _;
    }

    function PreIcoFinalizeAgent(CrowdSaleInterface _crowdSale, PricingStrategyInterface _icoPricingStrategy) public {
        crowdSale = _crowdSale;
        require(crowdSale.isCrowdSale());

        icoStagesPricingStrategy = _icoPricingStrategy;
        require(icoStagesPricingStrategy.isPricingStrategy());
    }

    /**
     * @dev This method will ba called when PreIco stage will be finalized and it will setup the icoStages pricing strategy
     *      for the ico stage
     */
    function finalize() onlyCrowdSale public {
        crowdSale.setPricingStrategy(icoStagesPricingStrategy);
    }

    /**
     * @dev Interface method for checking finalize agent
     */
    function isFinalizeAgent() public constant returns (bool) {
        return true;
    }
}
