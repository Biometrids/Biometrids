pragma solidity 0.4.18;


import "./interfaces/PricingStrategyInterface.sol";
import "./interfaces/FinalizeAgentInterface.sol";


contract BaseCrowdSale {
    //todo Add all check in finalize methods of crowdsale
    //todo set the finalized timestamps in the crowdsale

    uint256 public preIcoStartedTimestamp;

    uint256 public preIcoFinalizedTimestamp;

    uint256 public icoFinalizedTimestamp;

    uint256 public icoStartedTimestamp;

    PricingStrategyInterface public pricingStrategy;

    FinalizeAgentInterface public preIcoFinalizeAgent;

    FinalizeAgentInterface public icoFinalizeAgent;

    enum Status {Unknown, PreIco, PreIcoFinalized, Ico, Success, Failed}

    Status status = Status.Unknown;

    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) public;

    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) public;

    function setICOFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) public;

    function startPreIco() public;

    function finalizePreIco() public;

    function startIco() public;

    function finalizeIco() public;

    function invest() public;
}
