import UrlAssembler from 'url-assembler';

export interface IUrlFArg {
  param?: object;
  query?: object;
}

/**
 * Format url.
 */
export function urlf(url: string, arg?: IUrlFArg): string {
  let ret = new UrlAssembler(url);
  if (arg) {
    const { param, query } = arg;
    ret = ret.param(param).query(query);
  }
  return ret.toString();
}
