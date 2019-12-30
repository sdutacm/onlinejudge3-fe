import { message } from 'antd';
import constants from '../configs/constants';
import tracker from '@/utils/tracker';

export default {
  onError(e) {
    try {
      const status = e.response.status;
      let msg;
      switch (status) {
        case 403:
          msg = 'You are not allowed to view this page';
          break;
        default:
          msg = e.message;
      }
      message.error(msg, constants.msgDuration.error);
    }
    catch (err) {
      message.error('Network error', constants.msgDuration.error);
    }

    try {
      tracker.exception({
        description: JSON.stringify({
          error: e.toString(),
          method: e.response.config.method,
          url: e.request.responseURL,
        }),
      });
    } catch (err) {
      tracker.exception({
        description: `${e}`,
      });
    }
  },
};
