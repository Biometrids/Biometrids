pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "./interfaces/PricingStrategyInterface.sol";


contract PreIcoPricingStrategy is PricingStrategyInterface, HasNoEther {
    using SafeMath for uint256;

    /** 910 IDS for 1 ether */
    uint256 public oneTokenInWei = 1 ether / uint256(910);

    /**
     * @dev Interface method for checking pricing strategy
     */
    function isPricingStrategy() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Fallback for interface compatibility
     */
    function initPricingStrategy(uint256 _startingTimestamp) public {}

    /**
     * @dev This is static strategy initialized by default
     */
    function strategyInitialized() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Calculate the current token amount for sent wei.
     * @param _weiSent Count wei sent
     * @param _decimals Count of decimals of the token
     * @return Amount of tokens for send wei
     */
    function calculateTokenAmount(uint256 _weiSent, uint256 _decimals) public constant returns (uint256 tokens)
    {
        uint256 multiplier = 10 ** _decimals;
        tokens = _weiSent.mul(multiplier) / oneTokenInWei;
    }
}
