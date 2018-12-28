import UrlAssembler from 'url-assembler';
import { floor } from 'math-precision';
import moment from 'moment';
import constants from '@/configs/constants';

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

export function preZeroFill(num: number, size: number): string {
  if (num >= Math.pow(10, size)) {
    return num.toString();
  }
  else {
    let str = Array(size + 1).join('0') + num;
    return str.slice(str.length - size);
  }
}

/**
 * format seconds to time string
 * @param {number} second
 * @param {boolean} showDay
 * @returns {string}
 */
export function secToTimeStr(second: number, showDay = false): string {
  let sec = second;
  let d = 0;
  if (showDay) {
    d = Math.floor(sec / 86400);
    sec %= 86400;
  }
  let h = Math.floor(sec / 3600);
  sec %= 3600;
  let m = Math.floor(sec / 60);
  sec %= 60;
  let s = Math.floor(sec);
  let str_d = '';
  if (showDay && d >= 1) {
    str_d = d + 'D ';
  }
  if (sec < 0) {
    return '--';
  }
  return str_d + preZeroFill(h, 2) + ':' + preZeroFill(m, 2) + ':' + preZeroFill(s, 2);
}

/**
 * Format number index to alphabet
 * @param {number | string} number
 * @returns {string}
 */
export function numberToAlphabet(number: number | string): string {
  let n = ~~number;
  let radix = 26;
  let cnt = 1;
  let p = radix;
  while (n >= p) {
    n -= p;
    cnt++;
    p *= radix;
  }
  let res = [];
  for (; cnt > 0; cnt--) {
    res.push(String.fromCharCode(n % radix + 65));
    n /= radix;
  }
  return res.reverse().join('');
}

export function formatAvatarUrl(fileName, full = false): string {
  if (!fileName) {
    return '';
  }
  if (full) {
    return `${constants.avatarUrlPrefix}${fileName}`;
  }
  return `${constants.avatarUrlPrefix}s_${fileName}`;
}
