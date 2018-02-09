import 'web3-typed/callback/web3';
import {address, IContract, IContractInstance, ISimpleCallable} from './globals';
import {NumberLike} from "bignumber.js";

interface Artifacts {
    require(name: './BiometridsToken.sol'): IContract<IBiometridsToken>;

    require(name: './CrowdSale.sol'): IContract<ICrowdSale>;

    require(name: './CrowdSaleRefundVault.sol'): IContract<ICrowdSaleRefundVault>;

    require(name: './IcoFinalizeAgent.sol'): IContract<IIcoFinalizeAgent>;

    require(name: './IcoStagesPricingStrategy.sol'): IContract<IIcoStagesPricingStrategy>;
}

declare global {
    const artifacts: Artifacts;
}

//Unknown, PreIco, PreIcoFinalized, Ico, Success, Failed
declare const enum ICOState {
    Unknown = 0,
    PreIco = 1,
    PreIcoFinalized = 2,
    Ico = 3,
    Success = 4,
    Failed = 5
}

interface IOwnable {
    owner: ISimpleCallable<address>;

    OwnershipTransferred(previousOwner: string, newOwner: string): Promise<any>;
}

interface IBiometridsToken extends IContractInstance, IOwnable {
    name: ISimpleCallable<string>;

    symbol: ISimpleCallable<string>;

    totalSupply: ISimpleCallable<NumberLike>;

    decimals: ISimpleCallable<NumberLike>;
}

interface ICrowdSale extends IContractInstance, IOwnable {
    wallet: ISimpleCallable<string>;
    status: ISimpleCallable<number>;
    weiSoftCap: ISimpleCallable<NumberLike>;
    weiHardCap: ISimpleCallable<NumberLike>;

    setIcoFinalizeAgent(address: string): Promise<any>

    allowAddress(address: string, allow: boolean): Promise<any>
}

interface ICrowdSaleRefundVault extends IContractInstance {
    allowAddress(adress: string, allow: boolean): Promise<any>
}

interface IIcoFinalizeAgent extends IContractInstance {
}

interface IIcoStagesPricingStrategy extends IContractInstance {
    allowAddress(adress: string, allow: boolean): Promise<any>
}
