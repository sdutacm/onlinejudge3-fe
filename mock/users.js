import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'POST /api2/users': (req, res) => {
    res.send(randomResponse([
      success({
        userId: 2,
        username: 'your username',
        nickname: 'your nickname',
      }),
      failure(101),
      failure(302),
      failure(303),
      failure(304),
      failure(305),
      failure(306),
      failure(307),
    ]));
  },
  'GET /api2/users': success({
    page: 1,
    total: 1,
    limit: 10,
    rows: [
      {
        userId: 1,
        username: 'Username',
        nickname: 'Nickname',
        school: 'School',
        college: 'College',
        major: 'Major',
        class: 'Class',
        avatar: 'https://avatar.url',
        accepted: 21,
        submitted: 100,
      },
    ],
  }),
  'GET /api2/users/1': success({
    userId: 1,
    username: 'Username',
    nickname: 'Nickname',
    school: 'School',
    college: 'College',
    major: 'Major',
    class: 'Class',
    avatar: 'https://avatar.url',
    accepted: 21,
    submitted: 100,
    email: 'mail@example.com',
  }),
  'GET /api2/users/2': success({
    userId: 2,
    username: 'Username 2',
    nickname: 'Nickname 2',
    school: 'School 2',
    college: 'College 2',
    major: 'Major 2',
    class: 'Class 2',
    avatar: 'https://avatar.url2',
    accepted: 0,
    submitted: 0,
  }),
  'GET /api2/users/xxx': failure(301),
  'PATCH /api2/users/1': success(),
  'PATCH /api2/users/2': (req, res) => {
    res.send(randomResponse([
      failure(300),
      failure(304),
      failure(306),
      failure(307),
      failure(308),
      failure(309),
      failure(310),
      failure(311),
      failure(312),
    ]));
  },
};

export default delay(proxy, 1000);
