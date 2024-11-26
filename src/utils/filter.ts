import { replaceString } from '@/utils/misc';

export function simpleFilterHTML(html: string) {
  let res = (html || '').replace(/^&nbsp;/, '').trim();
  if (res === '<p></p>') {
    res = '';
  }
  process.env.CDN_PROXY &&
    (res = replaceString(res, [process.env.CDN_RAW_URL_BEFORE_PROXY], process.env.CDN_PROXY));
  return res;
}
