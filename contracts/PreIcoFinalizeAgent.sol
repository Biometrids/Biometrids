pragma solidity 0.4.18;


import "./interfaces/FinalizeAgentInterface.sol";
import "./BaseCrowdSale.sol";
import "./interfaces/PricingStrategyInterface.sol";


contract PreIcoFinalizeAgent is FinalizeAgentInterface {
    BaseCrowdSale public crowdSale;

    PricingStrategyInterface public icoStagesPricingStrategy;

    modifier onlyCrowdSale() {
        require(crowdSale == msg.sender);
        _;
    }

    function PreIcoFinalizeAgent(BaseCrowdSale _crowdSale, PricingStrategyInterface _icoPricingStrategy) public {
        crowdSale = _crowdSale;
        icoStagesPricingStrategy = _icoPricingStrategy;
    }

    /**
     * @dev This method will ba called when PreIco stage will be finalized and it will setup the icoStages pricing strategy
     *      for the ico stage
     */
    function finalize() onlyCrowdSale public {
        crowdSale.setPricingStrategy(icoStagesPricingStrategy);
    }
}
