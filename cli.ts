const promise = require('bluebird');
import Ajv = require('ajv');
import fs = require('fs');
import net = require('net');
import path = require('path');
// import moment = require('moment');
import {Strings, toIcoStateIdToName} from './lib/utils';
import * as Web3 from 'web3';
import {address, IContract} from './globals';
import {
    IBiometridsToken,
    ICrowdSale,
    ICrowdSaleRefundVault,
    IIcoFinalizeAgent,
    IIcoStagesPricingStrategy,
} from './contracts';
import {ICliConfig} from './cli.schema';
// import {BigNumber} from 'bignumber.js';

type ContractName =
    | 'BiometridsToken'
    | 'IcoStagesPricingStrategy'
    | 'CrowdSaleRefundVault'
    | 'CrowdSale'
    | 'IcoFinalizeAgent';

const ctx = {
    contractNames: [
        'BiometridsToken',
        'IcoStagesPricingStrategy',
        'CrowdSaleRefundVault',
        'CrowdSale',
        'IcoFinalizeAgent'
    ],
    cmdOpts: new Array<string>(),
    verbose: false,
    cfile: 'cli.yml',
    BiometridsToken: {},
    CrowdSale: {},
    CrowdSaleRefundVault: {},
    IcoFinalizeAgent: {},
    IcoStagesPricingStrategy: {},
} as {
    contractNames: string[];
    cmd: string;
    cmdOpts: string[];
    cfile: string;
    cfg: ICliConfig;
    verbose: boolean;
    web3: Web3;
    provider: Web3.providers.Provider;
    BiometridsToken: {
        meta: IContract<IBiometridsToken>;
        instance: IBiometridsToken;
    };
    CrowdSale: {
        meta: IContract<ICrowdSale>;
        instance: ICrowdSale;
    };
    CrowdSaleRefundVault: {
        meta: IContract<ICrowdSaleRefundVault>;
        instance: ICrowdSaleRefundVault;
    };
    IcoFinalizeAgent: {
        meta: IContract<IIcoFinalizeAgent>;
        instance: IIcoFinalizeAgent;
    };
    IcoStagesPricingStrategy: {
        meta: IContract<IIcoStagesPricingStrategy>;
        instance: IIcoStagesPricingStrategy;
    };
};

const handlers = {} as {
    [k: string]: () => Promise<void>;
};


async function setup() {
    const TruffleContract = require('truffle-contract');
    loadConfig(ctx.cfile);
    await setupWeb3();
    await loadDeployedContracts();

    async function loadDeployedContracts() {
        const ecfg = ctx.cfg.ethereum;
        const w3defaults = {
            from: ecfg.from,
            gas: ecfg.gas,
            gasPrice: ecfg.gasPrice
        };
        return promise.mapSeries(ctx.contractNames, async (cn: any) => {
            const c = ctx as any;
            c[cn].meta = TruffleContract(JSON.parse(fs.readFileSync(ecfg[cn].schema).toString()));
            c[cn].meta.setProvider(ctx.web3.currentProvider);
            c[cn].meta.defaults(w3defaults);
            c[cn].meta.synchronization_timeout = 0;
            const addr = !!ecfg[cn]['instance'] ? ecfg[cn]['instance'] : readDeployedContractAddress(cn);
            if (addr) {
                c[cn].instance = await c[cn].meta.at(addr);
                console.log(`Loaded ${cn} instance at: ${addr}`);
            }
        });
    }

    async function setupWeb3() {
        const ecfg = ctx.cfg.ethereum;
        const endpoint = ecfg.endpoint.trim();
        if (endpoint.startsWith('ipc://')) {
            console.log(`Using Web3.providers.IpcProvider for ${endpoint}`);
            ctx.provider = new Web3.providers.IpcProvider(endpoint.substring('ipc://'.length), net);
        } else if (endpoint.startsWith('http')) {
            console.log(`Using Web3.providers.HttpProvider provider for: ${endpoint}`);
            ctx.provider = new Web3.providers.HttpProvider(endpoint);
        } else {
            throw new Error(`Unknown web3 endpoint: '${endpoint}'`);
        }
        ctx.web3 = new Web3(ctx.provider);
        await promise.fromNode((cb: any) => {
            ctx.web3.version.getNode((err: any, node: any) => {
                if (err) {
                    cb(err);
                    return;
                }
                console.log(`web3 node: ${node}`);
                cb(err, node);
            });
        });
        await promise.fromNode((cb: any) => {
            ctx.web3.version.getNetwork((err: any, netId: any) => {
                if (err) {
                    cb(err);
                    return;
                }
                switch (netId) {
                    case '1':
                        console.log('w3 connected to >>>> MAINNET <<<<');
                        break;
                    case '2':
                        console.log('w3 connected to >>>> MORDEN <<<<');
                        break;
                    case '3':
                        console.log('w3 connected to >>>> ROPSTEN <<<<');
                        break;
                    default:
                        console.log('w3 connected to >>>> UNKNOWN <<<<');
                }
                cb(err, netId);
            });
        });
    }

    function loadConfig(cpath: string) {
        const ajv = new Ajv();
        const configSchema = require('./cli.schema.json');
        const yaml = require('js-yaml');
        const subst = {
            home: process.env['HOME'],
            cwd: process.cwd(),
            moduledir: __dirname
        };
        ctx.cfg = yaml.safeLoad(Strings.replaceTemplate(fs.readFileSync(cpath, 'utf8'), subst));
        if (!ajv.validate(configSchema, ctx.cfg)) {
            const msg = `env: Invalid configuration: ${cpath}: `;
            console.error(msg, ajv.errors);
            throw new Error(`Invalid configuration: ${cpath}`);
        }
        if (ctx.verbose) {
            console.log('Configuration ', JSON.stringify(ctx.cfg, null, 2));
        }
    }
}

function readDeployedContractAddress(contract: string): string | null {
    const p = path.join(ctx.cfg.ethereum.lockfilesDir, `${contract}.lock`);
    if (fs.existsSync(p)) {
        return fs.readFileSync(p).toString('utf8');
    } else {
        return null;
    }
}

function writeDeployedContractAddress(contract: string, addr: address) {
    const p = path.join(ctx.cfg.ethereum.lockfilesDir, `${contract}.lock`);
    fs.writeFileSync(p, addr);
}

function failIfDeployed(cname?: ContractName) {
    const c = ctx as any;
    if (cname) {
        if (c[cname].instance) {
            throw new Error(`Contract '${cname}' is already deployed`);
        }
    } else {
        ctx.contractNames.forEach(cn => failIfDeployed(cn as any));
    }
}

function failIfNotDeployed(cname?: ContractName) {
    const c = ctx as any;
    if (cname) {
        if (!c[cname].instance) {
            throw new Error(`Contract '${cname}' is not deployed`);
        }
    } else {
        ctx.contractNames.forEach(cn => failIfNotDeployed(cn as any));
    }
}

function checkEthNetwork() {
    return new Promise((resolve, reject) => {
        ctx.web3.eth.getSyncing((err: any, sync: any) => {
            if (err) {
                reject(err);
            }
            if (sync) {
                reject('Ethereum network client in pending synchronization, try again later');
            }
            resolve();
        });
    });
}

// -------------------- Operations

/**
 * Deploy
 */
handlers['deploy'] = async () => {
    await checkEthNetwork();
    const crowdSale = ctx.cfg.ethereum.CrowdSale;
    if (!ctx.BiometridsToken.instance) {
        throw new Error(`BiometridsToken not specified`);
    }

    if (!ctx.IcoStagesPricingStrategy.instance) {
        const tcfg = ctx.cfg.ethereum.IcoStagesPricingStrategy;
        console.log(`Deployment: 'IcoStagesPricingStrategy' `, tcfg);
        ctx.IcoStagesPricingStrategy.instance = await ctx.IcoStagesPricingStrategy.meta.new();
        console.log(`IcoStagesPricingStrategy successfully deployed at: ${ctx.IcoStagesPricingStrategy.instance.address}\n\n`);
        writeDeployedContractAddress('IcoStagesPricingStrategy', ctx.IcoStagesPricingStrategy.instance.address);
    }

    // if (!crowdSale.refundVault) {
    if (!ctx.CrowdSaleRefundVault.instance) {
        const tcfg = ctx.cfg.ethereum.CrowdSaleRefundVault;
        console.log(`Deployment: 'CrowdSaleRefundVault' `, tcfg);
        ctx.CrowdSaleRefundVault.instance = await ctx.CrowdSaleRefundVault.meta.new(tcfg.wallet);
        console.log(`CrowdSaleRefundVault successfully deployed at: ${ctx.CrowdSaleRefundVault.instance.address}\n\n`);
        writeDeployedContractAddress('CrowdSaleRefundVault', ctx.CrowdSaleRefundVault.instance.address);
    }
    // } else {
    //     console.log(`CrowdSaleRefundVault address from config: ${crowdSale.refundVault}\n\n`);
    // }

    if (!ctx.CrowdSale.instance) {
        const tcfg = ctx.cfg.ethereum.CrowdSale;
        let refundAddress = (!!crowdSale.refundVault) ? crowdSale.refundVault : ctx.CrowdSaleRefundVault.instance.address;
        console.log(`Deployment: 'CrowdSale' `, tcfg);
        ctx.CrowdSale.instance = await ctx.CrowdSale.meta.new(
            ctx.BiometridsToken.instance.address,
            refundAddress,
            ctx.IcoStagesPricingStrategy.instance.address
        );
        console.log(`CrowdSale successfully deployed at: ${ctx.CrowdSale.instance.address}\n\n`);
        writeDeployedContractAddress('CrowdSale', ctx.CrowdSale.instance.address);
    }

    if (!ctx.IcoFinalizeAgent.instance) {
        const tcfg = ctx.cfg.ethereum.IcoFinalizeAgent;
        console.log(`Deployment: 'IcoFinalizeAgent' `, tcfg);
        ctx.IcoFinalizeAgent.instance = await ctx.IcoFinalizeAgent.meta.new(
            ctx.CrowdSale.instance.address,
            ctx.CrowdSaleRefundVault.instance.address
        );
        console.log(`IcoFinalizeAgent successfully deployed at: ${ctx.IcoFinalizeAgent.instance.address}\n\n`);
        writeDeployedContractAddress('IcoFinalizeAgent', ctx.IcoFinalizeAgent.instance.address);
    }
    console.log("Setup finalize agents");
    await ctx.CrowdSale.instance.setIcoFinalizeAgent(ctx.IcoFinalizeAgent.instance.address);
    await ctx.CrowdSale.instance.allowAddress(ctx.IcoFinalizeAgent.instance.address, true);

    console.log("Setup refund vault");
    await ctx.CrowdSaleRefundVault.instance.allowAddress(ctx.IcoFinalizeAgent.instance.address, true);
    await ctx.CrowdSaleRefundVault.instance.allowAddress(ctx.CrowdSale.instance.address, true);

    await ctx.IcoStagesPricingStrategy.instance.allowAddress(ctx.CrowdSale.instance.address, true);
    console.log('DEPLOYED');
};

handlers['status'] = async () => {
    await checkEthNetwork();
    failIfNotDeployed();
    const token = ctx.BiometridsToken.instance;
    const ico = ctx.CrowdSale.instance;
    const data = {
        'token': {
            address: token.address,
            owner: await token.owner.call(),
            symbol: await token.symbol.call(),
            totalSupply: await token.totalSupply.call(),
            decimals: await token.decimals.call(),
        },
        'ico': {
            address: ico.address,
            owner: await ico.owner.call(),
            wallet: await ico.wallet.call(),
            state: toIcoStateIdToName(await ico.status.call() as any),
            softCapWei: await ico.weiSoftCap.call(),
            hardCapWei: await ico.weiHardCap.call(),
        }
    };
    console.log(JSON.stringify(data, null, 2));
};


// --------------------- Helpers

function pullCmdArg(name: string): address {
    const arg = ctx.cmdOpts.shift();
    if (!arg) {
        throw new Error(`Missing required ${name} argument for command`);
    }
    return arg;
}

// -------------------- Run

// Parse options
(function () {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; ++i) {
        const av = (args[i] = args[i].trim());
        if (av.charAt(0) !== '-') {
            if (ctx.cmd) {
                usage(`Command '${ctx.cmd}' already specified`);
            }
            ctx.cmd = av;
            ctx.cmdOpts = args.slice(i + 1);
            break;
        }
        if (av === '-h' || av === '--help') {
            usage();
        }
        if (av === '-v' || av === '--verbose') {
            ctx.verbose = true;
        }
        if (av === '-c' || av === '--config') {
            ctx.cfile = args[++i] || usage(`Missing '-c|--config' option value`);
        }
    }
    if (!ctx.cmd) {
        usage('No command specified');
    }
    if (!handlers[ctx.cmd]) {
        usage(`Invalid command specified: '${ctx.cmd}'`);
    }
    console.log(`Command: ${ctx.cmd} opts: `, ctx.cmdOpts);
})();

function usage(error?: string): never {
    console.error(
        'Usage: \n\tnode cli.js' +
        '\n\t[-c|--config <config yaml file>]' +
        '\n\t[-v|--verbose]' +
        '\n\t[-h|--help]' +
        '\n\t<command> [command options]' +
        '\nCommands:' +
        '\n\tdeploy               - Deploy BiometridsCrowdSale smart contracts' +
        '\n\tstatus               - Get contracts status' +
        '\n'
    );
    if (error) {
        console.error(error);
        process.exit(1);
    }
    process.exit();
    throw Error();
}

// Start
setup()
    .then(handlers[ctx.cmd])
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        if (err) {
            console.error(err);
        }
        process.exit(1);
    });