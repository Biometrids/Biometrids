pragma solidity 0.4.18;


import "./interfaces/RefundVaultInterface.sol";
import "./interfaces/FinalizeAgentInterface.sol";
import "./interfaces/CrowdSaleInterface.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";


contract IcoFinalizeAgent is FinalizeAgentInterface, HasNoEther {
    CrowdSaleInterface public crowdSale;

    RefundVaultInterface public refundVault;


    modifier onlyCrowdSale() {
        require(crowdSale == msg.sender);
        _;
    }

    function IcoFinalizeAgent(CrowdSaleInterface _crowdSale, RefundVaultInterface _refundVault) public {
        crowdSale = _crowdSale;
        require(crowdSale.isCrowdSale());

        refundVault = _refundVault;
        require(refundVault.isRefundVault());
    }

    /**
     * @dev This method will ba called when Ico stage will be finalized and it will enable refunds or transfer all fund on the main crowdsale wallet
     */
    function finalize() onlyCrowdSale public {
        if (crowdSale.isReachedSoftCap()) {
            refundVault.close();
        }
        else {
            refundVault.enableRefunds();
        }
    }

    /**
     * @dev Interface method for checking finalize agent
     */
    function isFinalizeAgent() public constant returns (bool) {
        return true;
    }
}
