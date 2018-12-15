import UrlAssembler from 'url-assembler';
import { floor } from 'math-precision';

interface UrlArg {
  param?: object;
  query?: object;
}

/**
 * Format url
 * @param {string} url
 * @param {UrlArg} arg
 * @returns {string}
 */
export function urlf(url: string, arg?: UrlArg): string {
  let ret = new UrlAssembler(url);
  if (arg) {
    const { param, query } = arg;
    ret = ret.param(param).query(query);
  }
  return ret.toString();
}

/**
 * Format a/b to percentage string
 * (1, 5) => 20.00%
 * (1, 3, 5) => 33.33333%
 * (50, 50) => 100%
 * (0, 20, 7) => 0%
 * (1, 999999) => 0.01%
 * @param {number} a
 * @param {number} b
 * @param {number} precision
 * @returns {string}
 */
export function formatPercentage(a: number, b: number, precision: number = 2): string {
  const prec = Math.max(Number(precision) || 0, 0);
  if (a <= 0 || b <= 0) {
    return '0%';
  }
  else if (Math.min(a, b) === b) {
    return '100%';
  }
  const ratio = floor(100 * Math.min(a, b) / b, prec);
  if (ratio < Math.pow(10, -prec)) {
    return Math.pow(10, -prec) + '%';
  }
  return parseFloat(ratio).toFixed(prec) + '%';
}
