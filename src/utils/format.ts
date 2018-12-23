import UrlAssembler from 'url-assembler';
import { floor } from 'math-precision';
import moment from 'moment';

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

/**
 * Format list query, and only reserve valid property
 * @param {ListQuery} query
 * @returns {ListQuery}
 */
export function formatListQuery(query: ListQuery): ListQuery {
  const formattedQuery: ListQuery = {
    ...query,
    page: +query.page || 1,
  };
  query.limit && (formattedQuery.limit = +query.limit);
  for (const q in formattedQuery) {
    if (formattedQuery.hasOwnProperty(q) && !formattedQuery[q]) {
      delete formattedQuery[q];
    }
  }
  return formattedQuery;
}

export function toLongTs(timestamp: Timestamp): Timestamp {
  return timestamp * 1000;
}

export function formatFullTime(timestamp: Timestamp): string {
  if (new Date().getFullYear() === new Date(timestamp).getFullYear()) {
    return moment(timestamp).format('MM-DD HH:mm');
  }
  return moment(timestamp).format('YYYY-MM-DD HH:mm');
}
