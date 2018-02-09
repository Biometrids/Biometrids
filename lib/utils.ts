import {ICOState} from "../contracts";

export type NU = null | undefined;
// tslint:disable-next-line:interface-over-type-literal
export type KVMap = {
  [option: string]: any;
};
export * from './utils/files';
export * from './utils/strings';

//Unknown, PreIco, PreIcoFinalized, Ico, Success, Failed
export function toIcoStateIdToName(val: BigNumber.BigNumber): string {
  switch (val.toNumber()) {
    case ICOState.Unknown:
      return 'Unknown';
    case ICOState.PreIco:
      return 'PreIco';
    case ICOState.PreIcoFinalized:
      return 'PreIcoFinalized';
    case ICOState.Ico:
      return 'Ico';
    case ICOState.Success:
      return 'Success';
    case ICOState.Failed:
      return 'Failed';
    default:
      throw new Error(`Unknown ico state: ${val}`);
  }
}
