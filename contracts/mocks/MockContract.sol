pragma solidity 0.4.18;


contract MockContract {
    bool public deployed = false;
    
    function MockContract() public {
        deployed = true;
    }
}
