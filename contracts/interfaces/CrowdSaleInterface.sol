pragma solidity 0.4.18;


import "./PricingStrategyInterface.sol";
import "./FinalizeAgentInterface.sol";
import "./TokenInterface.sol";


contract CrowdSaleInterface {
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) public;

    function setIcoFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) public;

    function startIco() public;

    function finalizeIco() public;

    function invest() public payable;

    function isReachedSoftCap() public constant returns (bool);

    function isReachedHardCap() public constant returns (bool);

    function isCrowdSale() public constant returns (bool);
}
