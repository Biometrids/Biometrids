pragma solidity 0.4.18;


import "../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";


contract OnlyAllowedAddresses is Ownable {
    mapping (address => bool) allowedAddresses;

    modifier onlyAllowedAddresses {
        require(msg.sender == owner || allowedAddresses[msg.sender] == true);
        _;
    }

    /**
     * Set allowance for address to interact with contract
     */
    function allowAddress(address _address, bool _allow) onlyOwner external {
        require(_address != address(0));
        allowedAddresses[_address] = _allow;
    }
}
