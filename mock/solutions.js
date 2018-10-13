import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'GET /api2/solutions': success({
    page: 1,
    total: 3,
    limit: 10,
    rows: [
      {
        solutionId: 10000,
        user: {
          userId: 1,
          username: 'Username',
          nickname: 'Nickname',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
        },
        problem: {
          problemId: 1000,
          title: 'Problem Title',
          timeLimit: 5000,
        },
        contest: {
          contestId: 1005,
          title: 'Contest Title',
        },
        result: 0,
        time: 0,
        memory: 0,
        language: 'g++',
        codeLength: 123,
        shared: true,
        createdAt: 1539334414,
      },
      {
        solutionId: 10001,
        user: {
          userId: 2,
          username: 'Username 2',
          nickname: 'Nickname 2',
          avatar: '',
        },
        problem: {
          problemId: 1001,
          title: 'Problem Title 1001',
          timeLimit: 5000,
        },
        result: 1,
        time: 0,
        memory: 250,
        language: 'python2',
        codeLength: 1500,
        shared: false,
        createdAt: 1538918602,
      },
      {
        solutionId: 10002,
        user: {
          userId: 2,
          username: 'Username 2',
          nickname: 'Nickname 2',
          avatar: '',
        },
        problem: {
          problemId: 1002,
          title: 'Problem Title 1002',
          timeLimit: 8000,
        },
        result: 8,
        time: 280,
        memory: 18080,
        language: 'java',
        codeLength: 2222,
        shared: false,
        createdAt: 1539072396,
      },
    ],
  }),
  'GET /api2/solutions/10000': success({
    solutionId: 10000,
    user: {
      userId: 1,
      username: 'Username',
      nickname: 'Nickname',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    },
    problem: {
      problemId: 1000,
      title: 'Problem Title',
      timeLimit: 5000,
    },
    contest: {
      contestId: 1005,
      title: 'Contest Title',
    },
    result: 0,
    time: 0,
    memory: 0,
    language: 'g++',
    codeLength: 123,
    shared: true,
    createdAt: 1539334414,
    code: '#include <stdio.h>\n\nint main() {\n    print("Hello World!");\n    return 0;\n}',
  }),
  'GET /api2/solutions/10001': success({
    solutionId: 10001,
    user: {
      userId: 2,
      username: 'Username 2',
      nickname: 'Nickname 2',
      avatar: '',
    },
    problem: {
      problemId: 1001,
      title: 'Problem Title 1001',
      timeLimit: 5000,
    },
    result: 8,
    time: 0,
    memory: 250,
    language: 'python2',
    codeLength: 1500,
    shared: false,
    createdAt: 1537262269,
  }),
  'GET /api2/solutions/401': failure(501),
  'GET /api2/solutions/402': failure(502),
  'POST /api2/solutions': (req, res) => {
    res.send(randomResponse([
      success({
        solutionId: 10002,
      }),
      // failure(503),
      // failure(504),
      // failure(505),
      // failure(506),
      // failure(507),
      // failure(508),
      // failure(509),
      // failure(510),
      // failure(511),
      // failure(512),
    ]));
  },
};

export default delay(proxy, 1000);
