pragma solidity 0.4.18;


import "./interfaces/CrowdSaleInterface.sol";
import "./interfaces/RefundVaultInterface.sol";
import "./library/OnlyAllowedAddresses.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";
import "./library/Whitelisted.sol";


contract CrowdSale is OnlyAllowedAddresses, Whitelisted, CrowdSaleInterface, Claimable {
    using SafeMath for uint256;

    /** Minimal value of ether needed */
    uint256 public constant weiSoftCap = 2300 ether;

    /** Maximal value of ether needed */
    uint256 public constant weiHardCap = 23000 ether;

    /** Minimal value allowed to be invested */
    uint256 public constant minimalInvestmentValue = 1 ether / 10;

    /** When ICO was started */
    uint256 public icoFinalizedTimestamp;

    /** When ICO was ended */
    uint256 public icoStartedTimestamp;

    /** Total amount of wei raised in the CrowdSale */
    uint256 public totalWeiRaised;

    /** Wei raised on ICO stage */
    uint256 public icoWeiRaised;

    /** Total number of tokens sold in the CrowdSale */
    uint256 public totalTokensSold;

    /** Tokens sold on ICO */
    uint256 public icoTokensSold;

    /** Total number of investors */
    uint256 public investorCount;

    /** Invested by users */
    mapping (address => uint256) public investedAmountOf;

    /** Tokens sent to users */
    mapping (address => uint256) public tokenAmountOf;

    /** Contract used for calculation tokens price */
    PricingStrategyInterface public pricingStrategy;

    /** This agent will ba called when ICO stage will be finalized */
    FinalizeAgentInterface public icoFinalizeAgent;

    /** Refund Vault use used to store funds until ICO stage will be finished. Then fund will be locked or unlocked for refund. */
    RefundVaultInterface public refundVault;

    /** Token contract */
    TokenInterface public token;

    /** Address of MultiSig wallet. Fund will be moved to wallet when ICO will be finished and SoftCap will be reached. */
    address public wallet;

    /** CrowdSale statuses list */
    enum Status {Unknown, Ico, Success, Failed}

    /** CrowdSale current status */
    Status public status = Status.Unknown;

    /**
     * A set of events which could be read from the blockchain
     */
    event IcoStarted(address indexed _sender, uint256 _timestamp);

    event Success(address indexed _sender, uint256 _timestamp, uint256 _weiRaised);

    event Failed(address indexed _sender, uint256 _timestamp, uint256 _weiRaised);

    event Invested(address indexed _investor, uint256 _weiAmount, uint256 _tokenAmount);

    event PricingStrategyChanged(address indexed _changer, uint256 _timestamp);

    event IcoFinalizeAgentChanged(address indexed _changer, uint256 _timestamp);

    /**
     * @dev All checks for the invest function
     */
    modifier allowedToInvest() {
        require(status == Status.Ico);
        require(msg.value >= minimalInvestmentValue);
        require(pricingStrategy.strategyInitialized());
        require(!isReachedHardCap());
        _;
    }

    function CrowdSale(TokenInterface _token, RefundVaultInterface _refundVault, PricingStrategyInterface _pricingStrategy) public {
        token = _token;
        require(token.isToken());

        refundVault = _refundVault;
        require(refundVault.isRefundVault());

        wallet = refundVault.getWallet();

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
    function invest() allowedToInvest onlyWhitelisted public payable {
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
        totalWeiRaised = totalWeiRaised.add(weiAmount);
        totalTokensSold = totalTokensSold.add(tokenAmount);

        //Update stage counters
        increaseStageCounters(weiAmount, tokenAmount);

        //Assign tokens
        assignTokens(receiver, tokenAmount);

        //Send ether to RefundVault
        forwardFunds(weiAmount, receiver);
    }

    /**
     * @dev Start main ICO stage and initialize 4 weeks pricing strategy
     */
    function startIco() onlyAllowedAddresses public {
        require(status == Status.Unknown);

        //Initialize pricing strategy with separated week stages
        pricingStrategy.initPricingStrategy(now);

        status = Status.Ico;
        icoStartedTimestamp = now;

        IcoStarted(msg.sender, icoStartedTimestamp);
    }

    /**
     * @dev Finalize ICO and set status of crowdsale Success
     * (send fund to the main multisig wallet) or Failed (unlocks funds for claim refund)
     */
    function finalizeIco() onlyAllowedAddresses public {
        require(status == Status.Ico);
        require(now >= (icoStartedTimestamp + 4 weeks));

        icoFinalizeAgent.finalize();

        icoFinalizedTimestamp = now;

        if (isReachedSoftCap()) {
            status = Status.Success;
            Success(msg.sender, icoFinalizedTimestamp, totalWeiRaised);
        }
        else {
            status = Status.Failed;
            Failed(msg.sender, icoFinalizedTimestamp, totalWeiRaised);
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
    function setIcoFinalizeAgent(FinalizeAgentInterface _icoFinalizeAgent) onlyAllowedAddresses public {
        icoFinalizeAgent = _icoFinalizeAgent;
        require(icoFinalizeAgent.isFinalizeAgent());

        IcoFinalizeAgentChanged(msg.sender, now);
    }

    /**
     * @dev Is wei was raised enough to reach soft cap
     */
    function isReachedSoftCap() public constant returns (bool) {
        return icoWeiRaised >= weiSoftCap;
    }

    /**
     * @dev Is wei was raised enough to reach hard cap
     */
    function isReachedHardCap() public constant returns (bool) {
        return icoWeiRaised >= weiHardCap;
    }

    /**
     * @dev Interface method
     */
    function isCrowdSale() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Investors could claim a refund if CrowdSale was failed
     */
    function claimRefund() external {
        require(status == Status.Failed);
        refundVault.refund(msg.sender);
    }

    /**
     * @dev Increase stage counters
     */
    function increaseStageCounters(uint256 _weiAmount, uint256 _tokenAmount) private {
        if (status == Status.Ico) {
            icoWeiRaised = icoWeiRaised.add(_weiAmount);
            icoTokensSold = icoTokensSold.add(_tokenAmount);
        }
    }

    /**
     * @dev Forward invested fund to refund vault
     */
    function forwardFunds(uint256 _value, address _receiver) private {
        refundVault.deposit.value(_value)(_receiver);
    }

    /**
     * @dev Assign tokens to the investor
     */
    function assignTokens(address _receiver, uint256 _tokenAmount) private {
        token.transferFrom(owner, _receiver, _tokenAmount);
    }
}
