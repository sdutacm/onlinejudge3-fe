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
    problemDetail: '/contests/:id/problems/:index',
    solutions: '/contests/:id/solutions',
    solutionDetail: '/contests/:id/solutions/:sid',
    ranklist: '/contests/:id/ranklist',
  },
  messages: {
    index: '/messages',
  },
  favorites: {
    index: '/favorites',
  },
  sets: {
    index: '/sets',
    detail: '/sets/:id',
  },
  OJBK: '/OJBK',
};
