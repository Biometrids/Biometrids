pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "./interfaces/IcoStagesPricingStrategyInterface.sol";
import "./library/OnlyAllowedAddresses.sol";


contract IcoStagesPricingStrategy is IcoStagesPricingStrategyInterface, OnlyAllowedAddresses, HasNoEther {
    using SafeMath for uint256;

    struct StageWeek {
        /** UNIX timestamp when this week ends */
        uint256 endTime;
        uint256 oneTokenInWei;
    }

    /** Phase 0 is the forth week */
    StageWeek[5] public stageWeeks;

    /** How many active stageWeeks we have */
    uint8 public stageWeeksCount = 0;

    /** Is strategy was initialized */
    bool isInitialized;

    /** Strategy starting timestamp */
    uint256 public initializedAt;


    /**
     * @dev Interface method for checking pricing strategy
     */
    function isPricingStrategy() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Is strategy initialized. Public interface method
     */
    function strategyInitialized() public constant returns (bool) {
        return isInitialized;
    }

    /**
     * @dev Initialize stages for pricing strategy. Could be initialized from the crowdsale and separately by the owner
     */
    function initPricingStrategy(uint256 _startTimestamp) onlyAllowedAddresses public {
        require(_startTimestamp > 0);
        require(!strategyInitialized());

        /** Zero default week. Equal to the fourth week and will be applied if all stages passed */
        stageWeeks[0].endTime = 0;
        stageWeeks[0].oneTokenInWei = 1 ether / uint256(450);

        /** First week. 665 IDS/1eth */
        stageWeeks[1].endTime = _startTimestamp.add(1 weeks);
        stageWeeks[1].oneTokenInWei = 1 ether / uint256(665);

        /** Second week. 550 IDS/1eth */
        stageWeeks[2].endTime = _startTimestamp.add(2 weeks);
        stageWeeks[2].oneTokenInWei = 1 ether / uint256(550);

        /** Third week. 500 IDS/1eth */
        stageWeeks[3].endTime = _startTimestamp.add(3 weeks);
        stageWeeks[3].oneTokenInWei = 1 ether / uint256(500);

        /** Fourth week. 450 IDS/1eth */
        stageWeeks[4].endTime = _startTimestamp.add(4 weeks);
        stageWeeks[4].oneTokenInWei = 1 ether / uint256(450);

        stageWeeksCount = 5;
        isInitialized = true;
    }

    /**
     * @dev Calculate the current token amount for sent wei.
     * @param _weiSent Count wei sent
     * @param _decimals Count of decimals of the token
     * @return Amount of tokens for send wei
     */
    function calculateTokenAmount(uint256 _weiSent, uint256 _decimals) public constant returns (uint256 tokens)
    {
        require(strategyInitialized());
//        uint256 multiplier = 10 ** _decimals;
//        tokens = _weiSent.mul(multiplier) / oneTokenInWei;
    }

    /**
     * @dev Get index of current week or fallback to zero week
     */
    function getCurrentPhaseIndex() public constant returns (uint8 stageWeekIndex) {
        stageWeekIndex = 0;
        for (uint8 i = 0; i < stageWeeks.length; i++) {
            if (now <= stageWeeks[i].endTime) {
                stageWeekIndex = i;
                return;
            }
        }
    }

    /**
     * @dev Return current week attributes to external caller
     * @return Array of current phase properties
     */
    function getCurrentWeekAttributes() public constant returns (uint256 endTime, uint256 oneTokenInWei) {
        return getWeekAttributes(getCurrentPhaseIndex());
    }

    /**
     * @dev Get selected week attributes
     * @return Array of current phase properties
     */
    function getWeekAttributes(uint _weekIndex) public constant returns (uint256 endTime, uint256 oneTokenInWei) {
        require(_weekIndex <= stageWeeksCount);

        return (
            stageWeeks[_weekIndex].endTime,
            stageWeeks[_weekIndex].oneTokenInWei
        );
    }
}
