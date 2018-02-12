pragma solidity 0.4.18;


import "./OnlyAllowedAddresses.sol";


contract Whitelisted is OnlyAllowedAddresses {

    /// @dev True if whitelist enabled
    bool public whitelistEnabled = false;

    /// @dev ICO whitelist
    mapping(address => bool) public whitelist;

    event ICOWhitelisted(address indexed addr);
    event ICOBlacklisted(address indexed addr);

    modifier onlyWhitelisted {
        require(!whitelistEnabled || whitelist[msg.sender]);
        _;
    }

    /**
    * Add address to ICO whitelist
    * @param address_ Investor address
    */
    function whitelist(address address_) external onlyAllowedAddresses {
        whitelist[address_] = true;
        ICOWhitelisted(address_);
    }

    /**
     * Remove address from ICO whitelist
     * @param address_ Investor address
     */
    function blacklist(address address_) external onlyAllowedAddresses {
        delete whitelist[address_];
        ICOBlacklisted(address_);
    }

    /**
     * @dev Returns true if given address in ICO whitelist
     */
    function whitelisted(address address_) public view returns (bool) {
        if (whitelistEnabled) {
            return whitelist[address_];
        } else {
            return true;
        }
    }

    /**
     * @dev Enable whitelisting
     */
    function enableWhitelist() public onlyAllowedAddresses {
        whitelistEnabled = true;
    }

    /**
     * @dev Disable whitelisting
     */
    function disableWhitelist() public onlyAllowedAddresses {
        whitelistEnabled = false;
    }

}