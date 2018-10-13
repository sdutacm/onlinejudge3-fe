import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'GET /api2/contests': success({
    page: 1,
    total: 2,
    limit: 10,
    rows: [
      {
        contestId: 1005,
        title: 'Contest Title',
        category: 1,
        type: 1,
        startAt: 1537248900,
        endAt: 1537248920,
        createdAt: 1537210000,
        updatedAt: 1537210000,
        hidden: false,
      },
      {
        contestId: 1006,
        title: 'Contest Title 2',
        category: 1,
        type: 1,
        startAt: 1537258900,
        endAt: 1537258920,
        createdAt: 1537210000,
        updatedAt: 1537210000,
        hidden: true,
      },
    ],
  }),
  'GET /api2/contests/1005': success({
    contestId: 1005,
    title: 'Contest Title',
    category: 1,
    type: 1,
    description: 'Description',
    startAt: 1537248900,
    endAt: 1537248920,
    createdAt: 1537210000,
    updatedAt: 1537210000,
    hidden: false,
  }),
  'GET /api2/contests/1006': success({
    contestId: 1006,
    title: 'Contest Title 2',
    category: 1,
    type: 1,
    description: 'Description 2',
    startAt: 1537258900,
    endAt: 1537258920,
    createdAt: 1537210000,
    updatedAt: 1537210000,
    hidden: true,
  }),
  'GET /api2/contests/501': failure(601),
  'GET /api2/contests/502': failure(602),
};

export default delay(proxy, 500);
