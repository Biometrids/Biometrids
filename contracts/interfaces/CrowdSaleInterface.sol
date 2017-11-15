pragma solidity 0.4.18;


import "./PricingStrategyInterface.sol";
import "./FinalizeAgentInterface.sol";
import "./RefundVaultInterface.sol";
import "./TokenInterface.sol";

contract CrowdSaleInterface {
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) public;

    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) public;

    function setICOFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) public;

    function startPreIco() public;

    function finalizePreIco() public;

    function startIco() public;

    function finalizeIco() public;

    function invest() payable;

    function isReachedSoftCap() public constant returns (bool);

    function isReachedHardCap() public constant returns (bool);

    function isCrowdSale() public constant returns (bool);
}
