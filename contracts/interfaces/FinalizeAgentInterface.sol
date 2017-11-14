pragma solidity 0.4.18;


contract FinalizeAgentInterface {
    function finalize() public;

    function isFinalizeAgent() public constant returns (bool);
}
