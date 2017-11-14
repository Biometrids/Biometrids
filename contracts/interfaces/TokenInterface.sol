pragma solidity 0.4.18;


import "../../node_modules/zeppelin-solidity/contracts/token/ERC20.sol";


contract TokenInterface is ERC20 {
    function name() public constant returns (string);

    function symbol() public constant returns (string);

    function decimals() public constant returns (uint256);

    function isToken() public constant returns (bool);
}
