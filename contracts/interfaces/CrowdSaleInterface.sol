pragma solidity 0.4.18;


import "./PricingStrategyInterface.sol";
import "./FinalizeAgentInterface.sol";
import "./RefundVaultInterface.sol";
import "./TokenInterface.sol";

contract CrowdSaleInterface {
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) public;

    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) public;

    function setICOFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) public;

    function startPreIco() public returns (bool);

    function finalizePreIco() public returns (bool);

    function startIco() public returns (bool);

    function finalizeIco() public returns (bool);

    function invest() public returns (bool);

    function isReachedSoftCap() public constant returns (bool);

    function isReachedHardCap() public constant returns (bool);

    function isCrowdSale() public constant returns (bool);
}
