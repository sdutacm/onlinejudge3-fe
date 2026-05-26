import constants from '../configs/constants';
import tracker from '@/utils/tracker';

function showError(msg: string) {
  if (typeof document === 'undefined') {
    console.error(msg);
    return;
  }
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = [
    'position:fixed',
    'top:24px',
    'left:50%',
    'z-index:10001',
    'max-width:80vw',
    'transform:translateX(-50%)',
    'padding:8px 16px',
    'border-radius:4px',
    'box-shadow:0 4px 12px rgba(0,0,0,.15)',
    'background:#fff1f0',
    'border:1px solid #ffa39e',
    'color:#a8071a',
    'font-size:14px',
    'line-height:22px',
  ].join(';');
  document.body.appendChild(toast);
  window.setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, constants.msgDuration.error * 1000);
}

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
      showError(msg);
    } catch (err) {
      showError('Unknown error');
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
