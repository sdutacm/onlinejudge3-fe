import { message } from 'antd';
import constants from '@/configs/constants';

function success(msg: string) {
  message.success(msg, constants.msgDuration.success);
}

function error(msg: string) {
  message.error(msg, constants.msgDuration.error);
}

function auto(data) {
  if (!data.msg) return;
  if (data.success) {
    success(data.msg);
  }
  else {
    error(data.msg);
  }
}

export default {
  success,
  error,
  auto,
};
