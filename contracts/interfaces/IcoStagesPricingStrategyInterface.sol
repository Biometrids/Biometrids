pragma solidity 0.4.18;

import "./PricingStrategyInterface.sol";

contract IcoStagesPricingStrategyInterface is PricingStrategyInterface {
    function initPricingStrategy(uint256 _startingTimestamp) public;
    function strategyInitialized() public constant returns (bool);
}
