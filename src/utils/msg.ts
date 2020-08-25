import { message } from 'antd';
import constants from '@/configs/constants';
import { codeMsgs } from '@/common/codes';

function success(msg: string) {
  msg && message.success(msg, constants.msgDuration.success);
}

function error(msg: string) {
  msg && message.error(msg, constants.msgDuration.error);
}

function auto(data) {
  let msg = '';
  try {
    msg = data.msg || codeMsgs[data.code];
  }
  catch (err) {
    console.error(err);
  }
  if (data && data.success) {
    success(msg);
  }
  else {
    error(msg);
  }
}

export default {
  success,
  error,
  auto,
};
