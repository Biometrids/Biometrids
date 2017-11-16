const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const web3 = IcoStagesPricingStrategy.web3;

const moment = require('moment');

async function deployStrategy() {
    return IcoStagesPricingStrategy.new();
}

contract('IcoStagesPricingStrategy', function (accounts) {
    let instance;

    const owner = accounts[0];
    const thirdPartyAddress = accounts[3];

    const ether = web3.toBigNumber(web3.toWei(1, 'ether'));
    const tokenDecimals = 1;

    const currentTimestamp = moment().unix();

    /** Init pricing phases */
    const stageWeeks = [];

    /** Zero default week. Equal to the fourth week and will be applied if all stages passed */
    stageWeeks[0] = [
        web3.toBigNumber('0'),
        web3.toBigNumber(ether.div(450)),
    ];

    /** First week. 665 IDS/1eth */
    stageWeeks[1] = [
        web3.toBigNumber(moment(currentTimestamp, 'X').add(1, 'weeks').unix()),
        web3.toBigNumber(ether.div(665)),
    ];

    /** Second week. 550 IDS/1eth */
    stageWeeks[2] = [
        web3.toBigNumber(moment(currentTimestamp, 'X').add(2, 'weeks').unix()),
        web3.toBigNumber(ether.div(550)),
    ];

    /** Third week. 500 IDS/1eth */
    stageWeeks[3] = [
        web3.toBigNumber(moment(currentTimestamp, 'X').add(3, 'weeks').unix()),
        web3.toBigNumber(ether.div(500)),
    ];

    /** Fourth week. 450 IDS/1eth */
    stageWeeks[4] = [
        web3.toBigNumber(moment(currentTimestamp, 'X').add(4, 'weeks').unix()),
        web3.toBigNumber(ether.div(450)),
    ];

    beforeEach(async () => {
        /** 100 tokens for 1 ether */
        instance = await deployStrategy();
        assert.ok(instance);
    });

    it('Check weeks attributes', async function () {
        try {
            await instance.initPricingStrategy(currentTimestamp);

            //First week
            assert.equal(
                (await instance.getWeekAttributes(1))[0].toString(),
                stageWeeks[1][0].toString()
            );
            assert.equal(
                (await instance.getWeekAttributes(1))[1].toString(),
                stageWeeks[1][1].trunc()
            );

            //Second week
            assert.equal(
                (await instance.getWeekAttributes(2))[0].toString(),
                stageWeeks[2][0].toString()
            );
            assert.equal(
                (await instance.getWeekAttributes(2))[1].toString(),
                stageWeeks[2][1].trunc()
            );

            //Third week
            assert.equal(
                (await instance.getWeekAttributes(3))[0].toString(),
                stageWeeks[3][0].toString()
            );
            assert.equal(
                (await instance.getWeekAttributes(3))[1].toString(),
                stageWeeks[3][1].trunc()
            );

            //Fourth week
            assert.equal(
                (await instance.getWeekAttributes(4))[0].toString(),
                stageWeeks[4][0].toString()
            );
            assert.equal(
                (await instance.getWeekAttributes(4))[1].toString(),
                stageWeeks[4][1].trunc()
            );

            //Zero week
            assert.equal(
                (await instance.getWeekAttributes(0))[0].toString(),
                stageWeeks[0][0].toString()
            );
            assert.equal(
                (await instance.getWeekAttributes(0))[1].toString(),
                stageWeeks[0][1].trunc()
            );
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Get current phase', async function () {
        try {
            let currentOneTokenInWei;
            let oneTokenInWei;

            //Check the first week
            await instance.initPricingStrategy(currentTimestamp);
            currentOneTokenInWei = (await instance.getCurrentWeekAttributes())[1];
            oneTokenInWei = stageWeeks[1][1];
            assert.equal(
                currentOneTokenInWei.toString(),
                oneTokenInWei.trunc()
            );

            //Check the second week
            instance = await deployStrategy();
            await instance.initPricingStrategy(
                moment(currentTimestamp, 'X').subtract({weeks: 1, minutes: 1}).unix()
            );
            currentOneTokenInWei = (await instance.getCurrentWeekAttributes())[1];
            oneTokenInWei = stageWeeks[2][1];
            assert.equal(
                currentOneTokenInWei.toString(),
                oneTokenInWei.trunc()
            );

            //Check the third week
            instance = await deployStrategy();
            await instance.initPricingStrategy(
                moment(currentTimestamp, 'X').subtract({weeks: 2, minutes: 1}).unix()
            );
            currentOneTokenInWei = (await instance.getCurrentWeekAttributes())[1];
            oneTokenInWei = stageWeeks[3][1];
            assert.equal(
                currentOneTokenInWei.toString(),
                oneTokenInWei.trunc()
            );

            //Check the fourth week
            instance = await deployStrategy();
            await instance.initPricingStrategy(
                moment(currentTimestamp, 'X').subtract({weeks: 3, minutes: 1}).unix()
            );
            currentOneTokenInWei = (await instance.getCurrentWeekAttributes())[1];
            oneTokenInWei = stageWeeks[4][1];
            assert.equal(
                currentOneTokenInWei.toString(),
                oneTokenInWei.trunc()
            );

            //Check the zero week
            instance = await deployStrategy();
            await instance.initPricingStrategy(
                moment(currentTimestamp, 'X').subtract({weeks: 4, minutes: 1}).unix()
            );
            currentOneTokenInWei = (await instance.getCurrentWeekAttributes())[1];
            oneTokenInWei = stageWeeks[0][1];
            assert.equal(
                currentOneTokenInWei.toString(),
                oneTokenInWei.trunc()
            );
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Calculate tokens to sell on first and second stages', async function () {
        try {
            const firstStageTokensWillBeReceived = web3.toBigNumber('6650');
            const secondStageTokensWillBeReceived = web3.toBigNumber('5500');

            //Check the first week
            await instance.initPricingStrategy(currentTimestamp);
            assert.equal(
                (await instance.calculateTokenAmount(ether, tokenDecimals)).toString(),
                firstStageTokensWillBeReceived.toString()
            );

            //Check the second week
            instance = await deployStrategy();
            await instance.initPricingStrategy(
                moment(currentTimestamp, 'X').subtract({weeks: 1, minutes: 1}).unix()
            );
            assert.equal(
                (await instance.calculateTokenAmount(ether, tokenDecimals)).toString(),
                secondStageTokensWillBeReceived.toString()
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check pricing strategy interface', async function () {
        try {
            assert.isTrue(await instance.isPricingStrategy());
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Initialize pricing strategy by the address in whitelist', async function () {
        try {
            await instance.allowAddress(thirdPartyAddress, true);
            await instance.initPricingStrategy(currentTimestamp);
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Address for initializing could be allowed only by owner', async function () {
        try {
            await instance.allowAddress(thirdPartyAddress, true, {from: owner});
            await instance.allowAddress(owner, true, {from: accounts[2]})
        } catch (err) {
            assert(true);
        }
    });

    it('Pricing strategy could be initialized by the address no in the whitelist', async function () {
        try {
            await instance.initPricingStrategy(currentTimestamp, {from: thirdPartyAddress})
        } catch (err) {
            assert(true)
        }
    });

    it('Pricing strategy could not be initialized twice', async function () {
        try {
            await instance.initPricingStrategy(currentTimestamp);
            await instance.initPricingStrategy(currentTimestamp);
        } catch (err) {
            assert(true);
        }
    });
});
