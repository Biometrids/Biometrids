export namespace Strings {
  export function replaceTemplate(val: string, subst: any): string {
    const ret = new Array<string>();
    const re = /{(\w+)}/g;
    let cp = 0;
    for (let m; (m = re.exec(val));) {
      ret.push(val.substring(cp, m.index));
      ret.push(subst[m[1]] || m[1]);
      cp = re.lastIndex;
    }
    ret.push(val.substring(cp));
    return ret.join('');
  }
}
