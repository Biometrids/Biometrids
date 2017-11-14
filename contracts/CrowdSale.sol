pragma solidity 0.4.18;


import "./interfaces/CrowdSaleInterface.sol";
import "./library/OnlyAllowedAddresses.sol";
import "./CrowdSaleRefundVault.sol";


contract CrowdSale is OnlyAllowedAddresses, CrowdSaleInterface {
    //todo Add all check in finalize methods of crowdsale
    //todo set the finalized timestamps in the crowdsale

    uint256 public preIcoStartedTimestamp;

    uint256 public preIcoFinalizedTimestamp;

    uint256 public icoFinalizedTimestamp;

    uint256 public icoStartedTimestamp;

    PricingStrategyInterface public pricingStrategy;

    FinalizeAgentInterface public preIcoFinalizeAgent;

    FinalizeAgentInterface public icoFinalizeAgent;

    RefundVaultInterface public refundVault;

    TokenInterface public token;

    address public wallet;

    enum Status {Unknown, PreIco, PreIcoFinalized, Ico, Success, Failed}

    Status status = Status.Unknown;

    event PreIcoStarted();

    event PreIcoFinalized();

    event IcoStarted();

    event Success();

    event Failed();

    event Invest();

    event PricingStrategyChanged();

    event PreIcoFinalizeAgentChanged();

    event IcoFinalizeAgentChanged();

    function CrowdSale(TokenInterface _token, address _wallet, PricingStrategyInterface _pricingStrategy) public {
        token = _token;
        require(token.isToken());

        wallet = _wallet;
        refundVault = new CrowdSaleRefundVault(wallet);

        setPricingStrategy(_pricingStrategy);
    }

    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) onlyAllowedAddresses public {
        pricingStrategy = _pricingStrategy;
        require(pricingStrategy.isPricingStrategy());
    }

    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) onlyAllowedAddresses public {
        preIcoFinalizeAgent = _preIcoFinalizeAgent;
        require(preIcoFinalizeAgent.isFinalizeAgent());
    }

    function setICOFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) onlyAllowedAddresses public {
        icoFinalizeAgent = _icoFinalizeAgent;
        require(icoFinalizeAgent.isFinalizeAgent());
    }

    function invest() public returns (bool) {
        return true;
    }

    function startPreIco() onlyAllowedAddresses public returns (bool) {
        return true;
    }

    function finalizePreIco() onlyAllowedAddresses public returns (bool) {
        return true;
    }

    function startIco() onlyAllowedAddresses public returns (bool) {
        return true;
    }

    function finalizeIco() onlyAllowedAddresses public returns (bool) {
        return true;
    }

    function isReachedSoftCap() public constant returns (bool) {
        return true;
    }

    function isReachedHardCap() public constant returns (bool) {
        return true;
    }

    function isCrowdSale() public constant returns (bool) {
        return true;
    }
}
