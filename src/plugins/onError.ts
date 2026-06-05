import tracker from '@/utils/tracker';
import msg from '@/utils/msg';

export default {
  onError(e) {
    let shouldReport = true;
    try {
      const status = e.response?.status;
      let messageText;
      switch (status) {
        case 403: {
          messageText = `You are not allowed to view or operate (${e.apiName})`;
          shouldReport = false;
          break;
        }
        case 422: {
          shouldReport = false;
          const errorData = e.response?.data?.data || e.response?.data;
          if (errorData?.msg) {
            messageText = `Invalid request: ${
              errorData.msg.length < 50 ? errorData.msg : errorData.msg.substr(0, 50) + '...'
            } (${e.apiName})`;
            console.error(`RequestParamsError: [${e.apiName}]`, JSON.stringify(errorData, null, 2));
          } else {
            messageText = 'Invalid request';
          }
          break;
        }
        default:
          messageText = e.apiName ? `${e.message} (${e.apiName})` : e.message;
      }
      msg.error(messageText || 'Unknown error');
    } catch (err) {
      msg.error('Unknown error');
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
