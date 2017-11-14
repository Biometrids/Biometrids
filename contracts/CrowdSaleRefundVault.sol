pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/crowdsale/RefundVault.sol";
import "./library/OnlyAllowedAddresses.sol";
import "./interfaces/RefundVaultInterface.sol";


/**
 * @notice We use a fully tested impementation of refund vault from OpenZeppelin v1.3.0
 * Code https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/RefundVault.sol
 * Tests https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/RefundVault.js
 */

contract CrowdSaleRefundVault is RefundVaultInterface, RefundVault {
    function CrowdSaleRefundVault(address _wallet) RefundVault(_wallet) public {}

    function isRefundVault() public constant returns (bool) {
        return true;
    }
}
