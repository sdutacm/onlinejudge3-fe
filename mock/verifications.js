import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'POST /api2/verifications/email_code': (req, res) => {
    res.send(randomSuccessOrFailure(0.8, {
      retryAfter: 5 + Math.floor(Math.random() * 10),
    }, 201));
  },
};

export default delay(proxy, 2000);
