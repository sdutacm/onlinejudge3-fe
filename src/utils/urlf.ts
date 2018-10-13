import UrlAssembler from 'url-assembler';

interface UrlArg {
  param?: object;
  query?: object;
}

export default function urlf(url: string, arg?: UrlArg): string {
  let ret = new UrlAssembler(url);
  if (arg) {
    const { param, query } = arg;
    ret = ret.param(param).query(query);
  }
  return ret.toString();
}
