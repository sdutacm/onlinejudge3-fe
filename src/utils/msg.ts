import { message } from 'antd';
import constants from '@/configs/constants';
import codes from '@/configs/codes';

function success(msg: string) {
  msg && message.success(msg, constants.msgDuration.success);
}

function error(msg: string) {
  msg && message.error(msg, constants.msgDuration.error);
}

function auto(data) {
  const msg = data.msg || codes[data.code];
  if (data.success) {
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
