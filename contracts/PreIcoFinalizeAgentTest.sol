pragma solidity 0.4.18;

import "./PreIcoFinalizeAgent.sol";

contract PreIcoFinalizeAgentTest is PreIcoFinalizeAgent {
    function PreIcoFinalizeAgentTest(BaseCrowdSale _crowdSale, PricingStrategyInterface _icoPricingStrategy)
             PreIcoFinalizeAgent(_crowdSale, _icoPricingStrategy) public {}

    /**
     * @dev allow anyone to call finalize method. Only for testing!
     */
    modifier onlyCrowdSale() {
        _;
    }
}
