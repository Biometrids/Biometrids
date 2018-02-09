import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as path from 'path';

export namespace Files {
  export function ensureDirs(...fnames: Array<string | undefined>): Promise<any> {
    return <any>Bluebird.all(
      fnames.filter(fn => fn != null).map(fn => {
        return Bluebird.fromNode((cb: any) => {
          require('mkdirp')(fn, cb);
        });
      })
    );
  }

  export function fileWriteSafeDirs(
    fname: string,
    data: string | Buffer,
    options: {
      encoding?: string;
      mode?: number;
      flag?: string;
    } = {}
  ): Promise<any> {
    const wf = (cb: (err: NodeJS.ErrnoException) => void) => {
      fs.writeFile(fname, data, options, cb);
    };
    return Bluebird.fromNode(wf).catch(err => {
      if (err.code === 'ENOENT') {
        return ensureDirs(path.parse(fname).dir).then(() => {
          return Bluebird.fromNode(wf);
        });
      } else {
        return Bluebird.reject(err);
      }
    }) as any;
  }
}
