const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

import ether from './helpers/ether';
import initCrowdSale from '../migrations/modules/initCrowdSale';
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo} from './helpers/increaseTime'
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const moment = require('moment');

const BiometridsToken = artifacts.require('BiometridsToken.sol');
const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const IcoFinalizeAgent = artifacts.require('IcoFinalizeAgent.sol');
const CrowdSale = artifacts.require('CrowdSale.sol');
const CrowdSaleRefundVault = artifacts.require('CrowdSaleRefundVault.sol');

const icoTokensToSale = web3.toBigNumber('7e25');

const icoFourthWeekTokenPrice = ether(1).divToInt(2000);
// 1e18 - is 18 decimals
const icoTokensShouldBeReceived = ether(1).mul('1e18').divToInt(icoFourthWeekTokenPrice);

const crowdSaleStates = {
    'Unknown': 0,
    'Ico': 1,
    'Success': 2,
    'Failed': 3
};

const walletStates = {
    'Active': 0,
    'Refunding': 1,
    'Closed': 2
};

let tokenInstance;
let icoStagesPricingStrategyInstance;
let crowdSaleInstance;
let icoFinalizeAgentInstance;
let refundVaultInstance;
let wallet;

const setupCrowdSale = async () => {
    tokenInstance = await BiometridsToken.at(BiometridsToken.address);
    icoStagesPricingStrategyInstance = await IcoStagesPricingStrategy.deployed();
    crowdSaleInstance = await CrowdSale.deployed();
    refundVaultInstance = await CrowdSaleRefundVault.deployed();
    wallet = await refundVaultInstance.getWallet();

    icoFinalizeAgentInstance = await IcoFinalizeAgent.new(crowdSaleInstance.address, refundVaultInstance.address);

    //We are using the same module as for migrations
    await initCrowdSale(
        crowdSaleInstance,
        tokenInstance,
        icoStagesPricingStrategyInstance,
        refundVaultInstance,
        icoFinalizeAgentInstance.address,
        web3
    );

    // refundVaultInstance.address = await crowdSaleInstance.refundVault();
};


contract('CrowdSale', function ([owner, investor, thirdParty]) {
    before(async function () {
        await advanceBlock();
        await setupCrowdSale();
    });

    it('Check that CrowdSale initialized correctly', async function () {
        try {
            // Ico pricing strategy is set by default
            assert.equal(
                await crowdSaleInstance.pricingStrategy(),
                icoStagesPricingStrategyInstance.address
            );

            //Token is set
            assert.equal(
                await crowdSaleInstance.token(),
                tokenInstance.address
            );

            //Refund Vault is set
            assert.equal(
                await crowdSaleInstance.refundVault(),
                await icoFinalizeAgentInstance.refundVault()
            );

            //Ico finalize agent is set
            assert.equal(
                await crowdSaleInstance.icoFinalizeAgent(),
                icoFinalizeAgentInstance.address
            );

            //Check the initial allowance
            assert.equal(
                (await tokenInstance.allowance(owner, crowdSaleInstance.address)),
                icoTokensToSale.toString()
            );

            //Check ico finalize agent refund vault
            assert.equal(
                (await icoFinalizeAgentInstance.refundVault()),
                refundVaultInstance.address
            );
        } catch (err) {
            assert(false, err.message)
        }
    });


    it('Exception when trying to invest in Unknown mode', async function () {
        try {
            await crowdSaleInstance.invest({from: investor, value: ether(1)});
        } catch (err) {
            assert(true)
        }
    });

    it('Exception when trying to invest from blacklisted investor', async function () {
        try {
            await crowdSaleInstance.enableWhitelist();
            await crowdSaleInstance.blacklist(investor);
            await crowdSaleInstance.invest({from: investor, value: ether(1)});
        } catch (err) {
            assert(true)
        }
    });

    it('Exception when trying to set pricing strategy from the non whitelisted address', async function () {
        try {
            await crowdSaleInstance.setPricingStrategy(icoStagesPricingStrategyInstance.address, {from: thirdParty});
        } catch (err) {
            assert(true);
        }
    });

    it('Exception when trying to set ico finalize agent from the non-whitelisted address', async function () {
        try {
            await crowdSaleInstance.setIcoFinalizeAgent(icoFinalizeAgentInstance.address, {from: thirdParty});
        } catch (err) {
            assert(true);
        }
    });
});

contract('CrowdSale - Invest with Success flow', function ([owner, investor]) {
    before(async function () {
        await advanceBlock();
        await setupCrowdSale();
    });

    it('Could no finalize ICO while ICO is not actually started', async function () {
        await crowdSaleInstance.finalizeIco().should.be.rejectedWith(EVMRevert);
    });

    it('Start ICO', async function () {
        const icoTokensAllowed = web3.toBigNumber('70000000').mul(
            web3.toBigNumber(10).pow(await tokenInstance.decimals())
        );

        //Approve 70% of tokens to spend by crowdsale contract.
        await tokenInstance.approve(crowdSaleInstance.address, icoTokensAllowed);

        (await tokenInstance.allowance(owner, crowdSaleInstance.address))
        .should.be.bignumber.equal(icoTokensToSale);

        await crowdSaleInstance.startIco();

        (await crowdSaleInstance.status()).should.be.bignumber.equal(
            crowdSaleStates['Ico']
        );

        (await crowdSaleInstance.icoStartedTimestamp()).should.not.be.equal(0);

        //Make sure that ico stages was initialized
        (await icoStagesPricingStrategyInstance.stageWeeksCount()).should.be.bignumber.equal(5);
    });

    it('Invest in fourth week of ICO', async function () {
        //3 weeks and 1 day has passed from the start of the ICO
        await increaseTimeTo(moment(latestTime(), 'X').add({weeks: 3, days: 2}).unix());

        const initialRefundVaultBalance = web3.eth.getBalance(refundVaultInstance.address);
        const initialInvestorTokens = await tokenInstance.balanceOf(investor);

        await crowdSaleInstance.invest({value: ether(1), from: investor});

        (await tokenInstance.balanceOf(investor))
        .should.be.bignumber.equal(initialInvestorTokens.add(icoTokensShouldBeReceived));

        (await web3.eth.getBalance(refundVaultInstance.address))
        .should.be.bignumber.equal(initialRefundVaultBalance.add(ether(1)));
    });

    it('Could not finalize ICO while at least 4 weeks have not passed', async function () {
        await crowdSaleInstance.finalizeIco().should.be.rejectedWith(EVMRevert);
    });

    it('Invest up to investment hardcap', async function () {
        const etherNeedToInvest = (await crowdSaleInstance.weiHardCap());
        await crowdSaleInstance.invest({value: etherNeedToInvest, from: investor});

        //Trying to break hardcap
        await crowdSaleInstance.invest({value: ether(1), from: investor}).should.be.rejectedWith(EVMRevert);
    });

    it('Finalize ICO with success', async function () {
        await increaseTimeTo(moment(latestTime(), 'X').add({weeks: 1, days: 2}).unix());

        const initialVaultBalance = (await web3.eth.getBalance(refundVaultInstance.address));

        await crowdSaleInstance.finalizeIco();

        (await crowdSaleInstance.status()).should.be.bignumber.equal(crowdSaleStates['Success']);
        (await crowdSaleInstance.icoFinalizedTimestamp()).should.be.bignumber.not.equal(0);

        (await refundVaultInstance.state()).should.be.bignumber.equal(walletStates['Closed']);

        await crowdSaleInstance.claimRefund().should.be.rejectedWith(EVMRevert);
        await crowdSaleInstance.invest({value: ether(1), from: investor}).should.be.rejectedWith(EVMRevert);

        (await web3.eth.getBalance(
            refundVaultInstance.address
        )).should.be.bignumber.equal(0);
    });
});

contract('CrowdSale - Whitelisting', function ([owner, investor]) {
    it('Can manage whitelist with success', async function () {
        await crowdSaleInstance.enableWhitelist({from: owner});
        (await crowdSaleInstance.whitelistEnabled.call()).should.be.equal(true);
        await crowdSaleInstance.disableWhitelist({from: owner});
        (await crowdSaleInstance.whitelistEnabled.call()).should.be.equal(false);
    });

    it('Only allowed addresses can manage whitelisting', async function () {
        await crowdSaleInstance.enableWhitelist({from: investor}).should.be.rejectedWith(EVMRevert);
        (await crowdSaleInstance.whitelistEnabled.call()).should.be.equal(false);
        await crowdSaleInstance.enableWhitelist({from: owner});
        (await crowdSaleInstance.whitelistEnabled.call()).should.be.equal(true);
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(false);
        await crowdSaleInstance.whitelist(investor, {from: investor}).should.be.rejectedWith(EVMRevert);
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(false);
        await crowdSaleInstance.whitelist(investor, {from: owner});
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(true);
        await crowdSaleInstance.blacklist(investor, {from: investor}).should.be.rejectedWith(EVMRevert);
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(true);
        await crowdSaleInstance.blacklist(investor, {from: owner});
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(false);
        await crowdSaleInstance.disableWhitelist({from: investor}).should.be.rejectedWith(EVMRevert);
        (await crowdSaleInstance.whitelistEnabled.call()).should.be.equal(true);
        await crowdSaleInstance.disableWhitelist({from: owner});
    });

    it('Can whitelist investor with success', async function () {
        await crowdSaleInstance.enableWhitelist({from: owner});
        await crowdSaleInstance.whitelist(investor, {from: owner});
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(true);
        await crowdSaleInstance.disableWhitelist({from: owner});
    });

    it('Can blacklist investor with success', async function () {
        await crowdSaleInstance.enableWhitelist({from: owner});
        await crowdSaleInstance.whitelist(investor, {from: owner});
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(true);
        await crowdSaleInstance.blacklist(investor, {from: owner});
        (await crowdSaleInstance.whitelisted(investor, {from: owner})).should.be.equal(false);
        await crowdSaleInstance.disableWhitelist({from: owner});
    })
});

contract('CrowdSale - Invest with Failed flow', function ([owner, investor]) {
    before(async function () {
        await advanceBlock();
        await setupCrowdSale();
    });

    it('Fail the crowdsale and get refund', async function () {
        await crowdSaleInstance.startIco();
        await crowdSaleInstance.invest({value: ether(2), from: investor});
        const initialVaultBalance = await web3.eth.getBalance(refundVaultInstance.address);

        await increaseTimeTo(moment(latestTime(), 'X').add({weeks: 4, days: 1}).unix());
        await crowdSaleInstance.finalizeIco();
        await crowdSaleInstance.claimRefund({from: investor});

        (await web3.eth.getBalance(refundVaultInstance.address))
        .should.be.bignumber.not.equal(initialVaultBalance);
    })
});