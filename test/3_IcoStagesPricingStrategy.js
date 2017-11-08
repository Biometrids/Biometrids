const IcoStagesPricingStrategy = artifacts.require('IcoStagesPricingStrategy.sol');
const web3 = IcoStagesPricingStrategy.web3;

const moment = require('moment');
const expectThrow = require('./helpers/expectThrow');

async function deployStrategy() {
    return IcoStagesPricingStrategy.new();
}

contract('IcoStagesPricingStrategy', function (accounts) {
    let instance;

    const owner = accounts[0];

    const ether = web3.toBigNumber(web3.toWei(1, 'ether'));

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

    it('Init and check stage weeks properties', async function () {
        try {
            await instance.initPricingStrategy(currentTimestamp);
        } catch (err) {
            assert(false, err.message)
        }
    });
});
