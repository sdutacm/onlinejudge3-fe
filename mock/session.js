import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'GET /api2/session': (req, res) => {
    res.send(randomSuccessOrFailure(1, {
      userId: 1,
      username: 'mocked username',
      nickname: 'mocked nickname',
      permission: 2,
    }, 100));
  },
  'POST /api2/session': (req, res) => {
    res.send(randomResponse([
      success({
        userId: 1,
        username: 'mocked username',
        nickname: 'mocked nickname',
        permission: 2,
      }),
      failure(101),
      failure(102),
      failure(103),
    ]));
  },
  'DELETE /api2/session': success(),
};

export default delay(proxy, 0);
