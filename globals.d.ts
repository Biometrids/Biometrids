import 'web3-typed/callback/web3';
import * as Web3 from 'web3';
import { TransactionReceipt, Contract } from 'web3';
import { ParsedLog } from 'web3/parsed';
import { NumberLike } from 'bignumber.js';

type address = string;
type network = string;

interface IContractOptions {
  from?: address;
  gas?: NumberLike;
  gasPrice?: NumberLike;
  value?: NumberLike;
}

interface IContract<T> {
  'new'(...args: any[]): Promise<T>;
  deployed(): Promise<T>;
  at(address: address): Promise<T>;
  setProvider(provider: Web3.providers.Provider): void;
  defaults(opts: IContractOptions): void;
  isDeployed(): boolean;
  resetAddress(): void;
  hasNetwork(networkId: network): boolean;
  detectNetwork(): Promise<network | undefined>;
  web3: Web3;
  currentProvider: Web3.providers.Provider;
  synchronization_timeout: number;
  network_id: network;
}

interface ITXResult {
  tx: string;
  receipt: TransactionReceipt;
  logs: ParsedLog<string, any>[];
}

// interface IParsedLog extends ParsedLog<any, any> {}

interface ItTestFn {
  (name: string, exec: (done: (err: any) => void) => any): any;
  only: ItTestFn;
}

interface ISimpleCallable<T> {
  call(tr?: Web3.TransactionRequest): Promise<T>;
}

interface IContractInstance {
  abi: any[];
  address: address;
  contract: Contract;
  sendTransaction(request: Web3.TransactionRequest): Promise<ITXResult>;
  send(value: NumberLike): Promise<ITXResult>;
}

interface IMigrations extends IContractInstance {
  lastCompletedMigration(): Promise<number>;
  setCompleted(completed: number): Promise<any>;
  setCompleted(upgrade: address): Promise<any>;
}

// Define global variables (truffle framework)
declare global {
  const contract: (name: string, test: (accounts: string[]) => any) => void;
  const web3: Web3;
}
