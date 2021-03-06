const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    const walletAddress = '0x95b9c3afb6799509e8ea82faae4080e268b460e6';

    deployer.deploy(CrowdSaleRefundVault, walletAddress);
    deployer.link(CrowdSaleRefundVault, CrowdSale);
};
