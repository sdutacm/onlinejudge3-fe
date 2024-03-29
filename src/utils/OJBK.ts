import { get, post } from '@/utils/request';
import { urlf } from '@/utils/format';
import jscookie from 'jscookie';
import md5 from 'md5';

const base = 'https://api.mushan.ink/';

function calcTcode(OJBK: string) {
  let sum = 0;
  for (let i = 0; i < OJBK.length; ++i) {
    const ch = OJBK.charCodeAt(i);
    sum += ch;
  }
  const count = sum % 7 + 1;
  let str = OJBK;
  for (let i = 0; i < count; ++i) {
    str += `${sum}`;
  }
  return md5(str);
}

async function checkOJBK() {
  return true;
  const OJBK = jscookie.get('OJBK');
  if (!OJBK) {
    return false;
  }
  let ret: any = {};
  try {
    ret = await get(urlf(base, { query: { OJBK } }));
  }
  catch (err) {
    console.error(err);
  }
  if (ret.success) {
    const tcode = ret.tcode;
    return calcTcode(OJBK) === tcode;
  }
  return false;
}

function setOJBK(OJBK) {
  return;
  jscookie.set({
    name: 'OJBK',
    value: OJBK,
    exdays: 30,
    path: '/',
  });
}

function logLogin(session) {
  return;
  const OJBK = jscookie.get('OJBK') || '!EMPTY';
  post(urlf(base, { query: { OJBK } }), {
    userId: session.userId,
    username: session.username,
    nickname: session.nickname,
  });
}

export default {
  checkOJBK,
  setOJBK,
  logLogin,
};
