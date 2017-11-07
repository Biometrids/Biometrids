const BiometridsToken = artifacts.require('BiometridsToken.sol');
const MockContract = artifacts.require('mocks/MockContract.sol');
const ERC223MockContract = artifacts.require('mocks/ERC223MockContract.sol');

const web3 = BiometridsToken.web3;
const web3Abi = require('web3-eth-abi');

const expectThrow = require('./helpers/expectThrow');


const tokenName = 'Biometrids Token';
const tokenSymbol = 'IDS';
const initialSupply = web3.toBigNumber('1e+26');
const decimals = web3.toBigNumber('18');

async function deployToken() {
    return BiometridsToken.new();
}

async function deployMock() {
    return MockContract.new();
}

async function deployERC223Mock() {
    return ERC223MockContract.new();
}

contract('BiometridsToken', function (accounts) {
    let instance;
    const owner = accounts[0];
    const thirdSender = accounts[3];

    const overloadedTransferFromAbi = {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    };

    const overloadedTransferAbi = {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    };

    beforeEach(async () => {
        instance = await deployToken();
        assert.ok(instance);
    });

    it('Check token properties', async function () {
        try {
            assert.equal(
                (await instance.totalSupply()).toString(),
                initialSupply.toString()
            );
            assert.equal(
                (await instance.decimals()).toString(),
                decimals.toString()
            );
            assert.equal((await instance.name()), tokenName);
            assert.equal((await instance.symbol()), tokenSymbol);
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check that tokens can be transfered', async function () {
        try {
            const tokensToSend = web3.toBigNumber('1e20');
            await instance.transfer(accounts[2], tokensToSend);
            const recipientBalance = await instance.balanceOf(accounts[2]);
            const senderBalance = await instance.balanceOf(owner);

            assert.equal(
                recipientBalance.toString(),
                tokensToSend.toString()
            );

            assert.equal(
                senderBalance.toString(),
                initialSupply.minus(tokensToSend).toString()
            );
        } catch (err) {
            assert(false, err.message);
        }

    });

    // transfer()
    it('Check that account can not transfer more tokens then have', async function () {
        try {
            await instance.transfer(accounts[2], 100, {from: owner});

            expectThrow(
                instance.transfer(accounts[3], 102, {from: accounts[2]})
            )
        } catch (err) {
            assert(false, err.message)
        }
    });

    it('Check account balance', async function () {
        try {
            await instance.transfer(accounts[2], 100, {from: owner});
            const recepientBalance = await instance.balanceOf.call(accounts[2]);
            assert.equal(recepientBalance.c[0], 100);
        } catch (err) {
            assert(false, err.message);
        }
    });

    // transferFrom()
    it('Check that account can transfer approved tokens', async function () {
        try {
            await instance.transfer(accounts[1], 100, {from: owner});
            await instance.approve(accounts[2], 50, {from: accounts[1]});
            await instance.transferFrom(accounts[1], accounts[3], 50, {from: accounts[2]});
            const recepientBalance = await instance.balanceOf.call(accounts[3]);
            assert.equal(recepientBalance.c[0], 50);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that tokens can be approved', async function () {
        try {
            const tokensForApprove = 666;
            assert.ok(
                await instance.approve(accounts[3], tokensForApprove, {from: owner})
            );
        } catch (err) {
            assert(false, err.message);
        }
    });

    // balanceOf()
    it('Check balance of owner account', async function () {
        try {
            const balance = await instance.balanceOf.call(owner);
            assert.equal(balance.valueOf(), initialSupply);
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that account can not transfer unapproved tokens', async function () {
        try {
            const expectedBalance = 66;

            expectThrow(
                instance.transferFrom(owner, accounts[2], expectedBalance, {from: accounts[1]})
            )
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that approved tokens are allowed', async function () {
        try {
            const tokensForApprove = 666;
            await instance.approve(accounts[1], tokensForApprove, {from: owner});
            const allowed = await instance.allowance(owner, accounts[1]);
            assert.equal(allowed.c[0], tokensForApprove, 'Allowed and approved tokens are not equal');
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that account without approved tokens have zero allowed tokens', async function () {
        try {
            const allowed = await instance.allowance(owner, accounts[1]);
            assert.equal(allowed.c[0], 0, 'Allowed token are not zero');
        } catch (err) {
            assert(false, err.message);
        }
    });

    it('Check that tokens could NOT be sent to contracts without tokenFallback impementation', async function () {
        try {
            const tokensToSend = web3.toBigNumber('1e20');
            let mockContractInstance = await deployMock();
            assert.ok(mockContractInstance);

            const transferMethodTransactionData = web3Abi.encodeFunctionCall(
                overloadedTransferAbi,
                [
                    mockContractInstance.address,
                    tokensToSend,
                    "0x00"
                ]
            );

            web3.eth.sendTransaction({from: owner, to: instance.address, data: transferMethodTransactionData, value: 0});
        } catch (err) {
            assert(true);
        }
    });

    it('Check that tokens could NOT be sent to contracts without tokenFallback impementation (transferFrom method)', async function () {
        try {
            const tokensToSend = web3.toBigNumber('1e20');
            let mockContractInstance = await deployMock();
            assert.ok(mockContractInstance);

            const transferFromMethodTransactionData = web3Abi.encodeFunctionCall(
                overloadedTransferFromAbi,
                [
                    owner,
                    mockContractInstance.address,
                    tokensToSend,
                    "0x00"
                ]
            );

            web3.eth.sendTransaction({from: owner, to: instance.address, data: transferFromMethodTransactionData, value: 0})
        } catch (err) {
            assert(true);
        }
    });

    it('Check that tokens could be sent to contracts which implemented tokenFallback for ERC223 compatibility', async function () {
        try {
            const tokensToSend = web3.toBigNumber('1e20');
            let mockContractInstance = await deployERC223Mock();
            assert.ok(mockContractInstance);

            const transferMethodTransactionData = web3Abi.encodeFunctionCall(
                overloadedTransferAbi,
                [
                    mockContractInstance.address,
                    tokensToSend,
                    "0x00"
                ]
            );

            await web3.eth.sendTransaction({from: owner, to: instance.address, data: transferMethodTransactionData, value: 0});

            assert.equal(
                (await instance.balanceOf(mockContractInstance.address)).toString(),
                tokensToSend.toString()
            );


            const transferFromMethodTransactionData = web3Abi.encodeFunctionCall(
                overloadedTransferFromAbi,
                [
                    owner,
                    mockContractInstance.address,
                    tokensToSend,
                    "0x00"
                ]
            );

            await instance.approve(thirdSender, tokensToSend, {from: owner});
            await web3.eth.sendTransaction({from: thirdSender, to: instance.address, data: transferFromMethodTransactionData, value: 0});

            assert.equal(
                (await instance.balanceOf(mockContractInstance.address)).toString(),
                tokensToSend.add(tokensToSend).toString()
            );
        } catch (err) {
            assert(false, err.message);
        }
    });
});
