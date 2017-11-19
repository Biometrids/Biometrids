const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');

module.exports = async function (deployer) {
    //todo Change wallet address. Should not be that same as contracts owner
    const walletAddress = '0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7';

    deployer.deploy(CrowdSaleRefundVault, walletAddress);
    deployer.link(CrowdSaleRefundVault, CrowdSale);
};
