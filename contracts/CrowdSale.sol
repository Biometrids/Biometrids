pragma solidity 0.4.18;


import "./interfaces/CrowdSaleInterface.sol";
import "./library/OnlyAllowedAddresses.sol";
import "./CrowdSaleRefundVault.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";


contract CrowdSale is OnlyAllowedAddresses, CrowdSaleInterface {
    using SafeMath for uint256;

    /** Minimal value of ether needed */
    uint256 public constant weiSoftCap = 5000 ether;

    /** Maximal value of ether needed */
    uint256 public constant weiHardCap = 110000 ether;

    /** Minimal value allowed to be invested */
    uint256 public constant minimalInvestmentValue = 1 ether / 10;

    /** When PreIco was started */
    uint256 public preIcoStartedTimestamp;

    /** When PreIco was ended */
    uint256 public preIcoFinalizedTimestamp;

    /** When ICO was started */
    uint256 public icoFinalizedTimestamp;

    /** When ICO was ended */
    uint256 public icoStartedTimestamp;

    /** Total amount of wei raised in the CrowdSale */
    uint256 public weiRaised;

    /** Total number of tokens sold in the CrowdSale */
    uint256 public tokensSold;

    /** Total number of investors */
    uint256 public investorCount;

    /** Invested by users */
    mapping (address => uint256) public investedAmountOf;

    /** Tokens sent to users */
    mapping (address => uint256) public tokenAmountOf;

    /** Contract used for calculation tokens price */
    PricingStrategyInterface public pricingStrategy;

    /** This agent will be called when PreIco stage will be finalized */
    FinalizeAgentInterface public preIcoFinalizeAgent;

    /** This agent will ba called when ICO stage will be finalized */
    FinalizeAgentInterface public icoFinalizeAgent;

    /** Refund Vault use used to store funds until ICO stage will be finished. Then fund will be locked or unlocked for refund. */
    CrowdSaleRefundVault public refundVault;

    /** Token contract */
    TokenInterface public token;

    /** Address of MultiSig wallet. Fund will be moved to wallet when ICO will be finished and SoftCap will be reached. */
    address public wallet;

    /** CrowdSale statuses list */
    enum Status {Unknown, PreIco, PreIcoFinalized, Ico, Success, Failed}

    /** CrowdSale current status */
    Status status = Status.Unknown;

    /**
     * A set of events which could be read from the blockchain
     */
    event PreIcoStarted(address indexed _sender, uint256 _timestamp);

    event PreIcoFinalized(address indexed _sender, uint256 _timestamp);

    event IcoStarted(address indexed _sender, uint256 _timestamp);

    event Success(address indexed _sender, uint256 _timestamp, uint256 _weiRaised);

    event Failed(address indexed _sender, uint256 _timestamp, uint256 _weiRaised);

    event Invested(address indexed _investor, uint256 _weiAmount, uint256 _tokenAmount);

    event PricingStrategyChanged(address indexed _changer, uint256 _timestamp);

    event PreIcoFinalizeAgentChanged(address indexed _changer, uint256 _timestamp);

    event IcoFinalizeAgentChanged(address indexed _changer, uint256 _timestamp);

    /**
     * @dev All checks for the invest function
     */
    modifier allowedToInvest() {
        require(status == Status.PreIco || status == Status.Ico);
        require(msg.value >= minimalInvestmentValue);
        require(pricingStrategy.strategyInitialized());

        /** Don't allow to invest if 7 days passed at PreIco stage */
        if (status == Status.PreIco) {
            require(now <= getPreIcoDeadline());
        }
        _;
    }

    function CrowdSale(TokenInterface _token, address _wallet, PricingStrategyInterface _pricingStrategy) public {
        token = _token;
        require(token.isToken());

        wallet = _wallet;
        refundVault = new CrowdSaleRefundVault(wallet);

        setPricingStrategy(_pricingStrategy);
    }

    /**
     * @dev Fallback function which will be called when investor just send ether on the crowdsale address
     */
    function() public payable {
        invest();
    }

    /**
     * @dev The main invest function which forward ether into RefundVault and Sends tokens to investors
     */
    function invest() allowedToInvest public payable {
        uint256 weiAmount = msg.value;
        address receiver = msg.sender;

        uint256 tokenAmount = pricingStrategy.calculateTokenAmount(weiAmount, token.decimals());

        require(tokenAmount > 0);

        if (investedAmountOf[receiver] == 0) {
            // A new investor
            investorCount++;
        }

        // Update investor
        investedAmountOf[receiver] = investedAmountOf[receiver].add(weiAmount);
        tokenAmountOf[receiver] = tokenAmountOf[receiver].add(tokenAmount);

        // Update totals
        weiRaised = weiRaised.add(weiAmount);
        tokensSold = tokensSold.add(tokenAmount);

        //Assign tokens
        assignTokens(receiver, tokenAmount);

        //Send ether to RefundVault
        forwardFunds();
    }

    /**
     * @dev Starting of PreIco company
     */
    function startPreIco() onlyAllowedAddresses public {
        require(status == Status.Unknown);

        status = Status.PreIco;
        preIcoStartedTimestamp = now;

        PreIcoStarted(msg.sender, preIcoStartedTimestamp);
    }

    /**
     * @dev Finalize Pre Ico if at least 7 days was passed
     */
    function finalizePreIco() onlyAllowedAddresses public {
        require(status == Status.PreIco);

        //Check that at least 7 days passed
        require(now >= getPreIcoDeadline());

        delegateCallFinalize(preIcoFinalizeAgent);

        status = Status.PreIcoFinalized;
        preIcoFinalizedTimestamp = now;

        PreIcoFinalized(msg.sender, preIcoFinalizedTimestamp);
    }

    /**
     * @dev Start main ICO stage and initialize 4 weeks pricing strategy
     */
    function startIco() onlyAllowedAddresses public {
        require(status == Status.PreIcoFinalized);
        //Check that at least 14 days was passed from the PreIco Deadline (not actual PreICO finalize date)
        require(now >= getPreIcoDeadline() + 14 days);

        //Initialize pricing strategy with separated week stages
        pricingStrategy.initPricingStrategy(now);

        status = Status.Ico;
        icoStartedTimestamp = now;

        IcoStarted(msg.sender, icoStartedTimestamp);
    }

    /**
     * @dev Finalize ICO and set status of crowdsale Success (send fund to the main multisig wallet) or Failed (unlocks funds for claim refund)
     */
    function finalizeIco() onlyAllowedAddresses public {
        require(status == Status.Ico);
        require(now >= (icoStartedTimestamp + 4 weeks));

        delegateCallFinalize(icoFinalizeAgent);

        icoFinalizedTimestamp = now;

        if (isReachedSoftCap()) {
            status = Status.Success;
            Success(msg.sender, icoFinalizedTimestamp, weiRaised);
        }
        else {
            status = Status.Failed;
            Failed(msg.sender, icoFinalizedTimestamp, weiRaised);
        }
    }

    /**
     * @dev Allows to change pricing strategy manually by the owner to fix fat fingers errors
     */
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) onlyAllowedAddresses public {
        pricingStrategy = _pricingStrategy;
        require(pricingStrategy.isPricingStrategy());

        PricingStrategyChanged(msg.sender, now);
    }

    /**
     * @dev Allows to change finalize agent manually by the owner to fix fat fingers errors
     */
    function setPreIcoFinalizeAgent(FinalizeAgentInterface _preIcoFinalizeAgent) onlyAllowedAddresses public {
        preIcoFinalizeAgent = _preIcoFinalizeAgent;
        require(preIcoFinalizeAgent.isFinalizeAgent());

        PreIcoFinalizeAgentChanged(msg.sender, now);
    }

    /**
     * @dev Allows to change finalize agent manually by the owner to fix fat fingers errors
     */
    function setIcoFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) onlyAllowedAddresses public {
        icoFinalizeAgent = _icoFinalizeAgent;
        require(icoFinalizeAgent.isFinalizeAgent());

        IcoFinalizeAgentChanged(msg.sender, now);
    }

    /**
     * @dev Is wei was raised enough to reach soft cap
     */
    function isReachedSoftCap() public constant returns (bool) {
        return weiRaised >= weiSoftCap;
    }

    /**
     * @dev Is wei was raised enough to reach hard cap
     */
    function isReachedHardCap() public constant returns (bool) {
        return weiRaised >= weiHardCap;
    }

    /**
     * @dev Interface method
     */
    function isCrowdSale() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Helper for calculation of PreIco deadline (7 days from the start)
     */
    function getPreIcoDeadline() public constant returns (uint256 deadline) {
        require(preIcoStartedTimestamp != 0);
        deadline = preIcoStartedTimestamp + 7 days;
    }

    /**
     * @dev Investors could claim a refund if CrowdSale was failed
     */
    function claimRefund() external {
        require(status == Status.Failed);
        refundVault.refund(msg.sender);
    }

    /**
     * @dev Forward invested fund to refund vault
     */
    function forwardFunds() private {
        refundVault.deposit.value(msg.value)(msg.sender);
    }

    /**
     * @dev Assign tokens to the investor
     */
    function assignTokens(address _receiver, uint256 _tokenAmount) private {
        token.transferFrom(owner, _receiver, _tokenAmount);
    }

    /**
     * @dev A wrapper for delegating call of finalize methods in finalize agents
     */
    function delegateCallFinalize(FinalizeAgentInterface _finalizeAgent) private {
        require(
        _finalizeAgent.delegatecall(bytes4(keccak256('finalize()')))
        );
    }
}
