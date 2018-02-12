import 'web3-typed/callback/web3';
import {address, IContract, IContractInstance, ISimpleCallable, ITXResult} from './globals';
import {NumberLike} from "bignumber.js";
import * as Web3 from "web3";

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

//Unknown, Ico, Success, Failed
declare const enum ICOState {
    Unknown = 0,
    Ico = 1,
    Success = 2,
    Failed = 3
}

interface IOwnable {
    owner: ISimpleCallable<address>;

    transferOwnership(newOwner: address, tr?: Web3.TransactionRequest): Promise<ITXResult>;
}

interface IOnlyAllowedAddresses extends IOwnable {

    /**
     * Set allowance for address to interact with contract
     */
    allowAddress(adress: string, allow: boolean, tr?: Web3.TransactionRequest): Promise<ITXResult>;
}

interface IWhitelisted extends IOnlyAllowedAddresses {

    whitelistEnabled: ISimpleCallable<boolean>;

    /**
     * Add address to ICO whitelist
     * @param addr Investor address
     */
    whitelist(addr: address, tr?: Web3.TransactionRequest): Promise<ITXResult>;

    /**
     * Remove address from ICO whitelist
     * @param addr Investor address
     */
    blacklist(addr: address, tr?: Web3.TransactionRequest): Promise<ITXResult>;

    /**
     * Enable whitelisting
     */
    enableWhitelist(tr?: Web3.TransactionRequest): Promise<ITXResult>;

    /**
     * Disable whitelisting
     */
    disableWhitelist(tr?: Web3.TransactionRequest): Promise<ITXResult>;

    whitelisted: {
        /**
         * Returns true if given address in ICO whitelist
         */
        call(addr: address, tr?: Web3.TransactionRequest): Promise<boolean>;
    };
}

interface IBiometridsToken extends IContractInstance, IOwnable {
    name: ISimpleCallable<string>;

    symbol: ISimpleCallable<string>;

    totalSupply: ISimpleCallable<NumberLike>;

    decimals: ISimpleCallable<NumberLike>;

    /**
     * Gets the balance of the specified address.
     * @param owner The address to query the the balance of.
     * @return An uint representing the amount owned by the passed address.
     */
    balanceOf: {
        call(addr: address, tr?: Web3.TransactionRequest): Promise<NumberLike>;
    };

    /**
     * Transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    transfer(to: address, value: NumberLike, tr?: Web3.TransactionRequest): Promise<ITXResult>;

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint the amount of tokens to be transferred
     */
    transferFrom(from: address, to: address, value: NumberLike, tr?: Web3.TransactionRequest): Promise<ITXResult>;

    /**
     * Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering.
     *
     * To change the approve amount you first have to reduce the addresses
     * allowance to zero by calling `approve(spender, 0)` if it is not
     * already 0 to mitigate the race condition described in:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    approve(spender: address, value: NumberLike, tr?: Web3.TransactionRequest): Promise<boolean>;

    /**
     * Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint specifying the amount of tokens still available for the spender.
     */
    allowance: {
        call(owner: address, spender: address, tr?: Web3.TransactionRequest): Promise<NumberLike>;
    };
}

interface ICrowdSale extends IContractInstance, IOnlyAllowedAddresses, IWhitelisted {
    wallet: ISimpleCallable<address>;
    status: ISimpleCallable<number>;
    weiSoftCap: ISimpleCallable<NumberLike>;
    weiHardCap: ISimpleCallable<NumberLike>;
    token: ISimpleCallable<address>;
    refundVault: ISimpleCallable<address>;
    pricingStrategy: ISimpleCallable<address>;

    icoFinalizedTimestamp: ISimpleCallable<NumberLike>;
    icoStartedTimestamp: ISimpleCallable<NumberLike>;
    totalWeiRaised: ISimpleCallable<NumberLike>;
    icoWeiRaised: ISimpleCallable<NumberLike>;
    totalTokensSold: ISimpleCallable<NumberLike>;
    icoTokensSold: ISimpleCallable<NumberLike>;
    investorCount: ISimpleCallable<NumberLike>;

    setIcoFinalizeAgent(address: address, tr?: Web3.TransactionRequest): Promise<ITXResult>;

    startIco(tr?: Web3.TransactionRequest): Promise<ITXResult>;

    finalizeIco(tr?: Web3.TransactionRequest): Promise<ITXResult>;
}

interface ICrowdSaleRefundVault extends IContractInstance {
    allowAddress(adress: string, allow: boolean): Promise<any>
}

interface IIcoFinalizeAgent extends IContractInstance {
}

interface IIcoStagesPricingStrategy extends IContractInstance {
    allowAddress(adress: string, allow: boolean): Promise<any>
}
