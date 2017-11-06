pragma solidity 0.4.18;

import "../library/ERC233/interfaces/ERC223ReceivingContract.sol";
import "./MockContract.sol";

contract ERC223MockContract is  MockContract, ERC223ReceivingContract {
    address public lastFallbackFrom;
    uint256 public lastFallbackValue;
    
    function tokenFallback(address _from, uint256 _value) public {
        lastFallbackFrom = _from;
        lastFallbackValue = _value;
    }
}
