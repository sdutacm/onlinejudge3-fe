import { message } from 'antd';
import constants from '../configs/constants';
import tracker from '@/utils/tracker';

export default {
  onError(e) {
    let shouldReport = true;
    try {
      const status = e.response.status;
      let msg;
      switch (status) {
        case 403: {
          msg = `You are not allowed to view or operate (${e.apiName})`;
          shouldReport = false;
          break;
        }
        case 422: {
          shouldReport = false;
          const errorData = e.response.data?.data;
          if (errorData?.msg) {
            msg = `Invalid request: ${
              errorData.msg.length < 50 ? errorData.msg : errorData.msg.substr(0, 50) + '...'
            } (${e.apiName})`;
            console.error(`RequestParamsError: [${e.apiName}]`, JSON.stringify(errorData, null, 2));
          } else {
            msg = 'Invalid request';
          }
          break;
        }
        default:
          msg = `${e.message} (${e.apiName})`;
      }
      message.error(msg, constants.msgDuration.error);
    } catch (err) {
      message.error('Unknown error', constants.msgDuration.error);
    }

    if (shouldReport) {
      try {
        tracker.exception({
          description: JSON.stringify({
            error: e.toString(),
            method: e.response.config.method,
            url: e.request.request.responseURL,
          }),
        });
      } catch (err) {
        tracker.exception({
          description: `${e}`,
        });
      }
    }
  },
};
