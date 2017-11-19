pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";
import "./interfaces/RefundVaultInterface.sol";
import "./library/OnlyAllowedAddresses.sol";


/**
 * @notice We use a fully tested impementation of refund vault from OpenZeppelin v1.3.0 with Whitelist option instead of onlyOwner modifier
 * Code https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/RefundVault.sol
 * Tests https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/RefundVault.js
 */
contract CrowdSaleRefundVault is RefundVaultInterface, OnlyAllowedAddresses, Claimable {
    using SafeMath for uint256;

    enum State {Active, Refunding, Closed}

    mapping (address => uint256) public deposited;

    address public wallet;

    State public state;

    event Closed();

    event RefundsEnabled();

    event Refunded(address indexed beneficiary, uint256 weiAmount);

    function CrowdSaleRefundVault(address _wallet) public {
        require(_wallet != 0x0);
        wallet = _wallet;
        state = State.Active;
    }

    function deposit(address investor) onlyAllowedAddresses public payable {
        require(state == State.Active);
        deposited[investor] = deposited[investor].add(msg.value);
    }

    function close() onlyAllowedAddresses public {
        require(state == State.Active);
        state = State.Closed;
        Closed();
        wallet.transfer(this.balance);
    }

    function enableRefunds() onlyAllowedAddresses public {
        require(state == State.Active);
        state = State.Refunding;
        RefundsEnabled();
    }

    function refund(address investor) public {
        require(state == State.Refunding);
        uint256 depositedValue = deposited[investor];
        deposited[investor] = 0;
        investor.transfer(depositedValue);
        Refunded(investor, depositedValue);
    }

    function isRefundVault() public constant returns (bool) {
        return true;
    }

    function getWallet() public constant returns (address) {
        return wallet;
    }
}
