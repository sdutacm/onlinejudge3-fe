export default {
  index: '/',
  problems: {
    index: '/problems',
    detail: '/problems/:id',
  },
  solutions: {
    index: '/solutions',
    detail: '/solutions/:id',
  },
  contest: {
    index: '/contest/acm',
  },
  users: {
    index: '/users',
    detail: '/users/:id',
  },
  contests: {
    index: '/contests',
    home: '/contests/:id',
    overview: '/contests/:id/overview',
    problems: '/contests/:id/problems',
    problemDetail: '/contests/:id/problems/:index',
    solutions: '/contests/:id/solutions',
    ranklist: '/contests/:id/ranklist',
  }
};
