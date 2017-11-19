pragma solidity 0.4.18;


import "../IcoFinalizeAgent.sol";
import "../CrowdSaleRefundVault.sol";


contract IcoFinalizeAgentTest is IcoFinalizeAgent {
    //We are creating RefundVault directly because we need to contracts as owner of vault
    function IcoFinalizeAgentTest(CrowdSaleInterface _crowdSale, CrowdSaleRefundVault _vault)
    IcoFinalizeAgent(_crowdSale, _vault) public {}

    /**
     * @dev allow anyone to call finalize method. Only for testing!
     */
    modifier onlyCrowdSale() {
        _;
    }
}
