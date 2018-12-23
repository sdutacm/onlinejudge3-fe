const api = {
  base: '/api',
  general: {
    csrf: '/csrf',
  },
  session: {
    base: '/session',
  },
  verifications: {
    code: '/verifications/code',
  },
  users: {
    base: '/users',
    detail: '/users/:id',
    password: '/users/:id/password',
    avatar: '/users/:id/avatar',
    bannerImage: '/users/:id/bannerImage',
    problemResultStats: '/users/:id/problemResultStats',
    solutionCalendar: '/users/:id/solutionCalendar',
  },
  problems: {
    base: '/problems',
    detail: '/problems/:id',
    tags: '/problems/:id/tags',
  },
  solutions: {
    base: '/solutions',
    detail: '/solutions/:id',
  },
  contest: {
    acm: {
      index: '/set/',
      problem: '/set_problem/',
      submit: '/submit',
      status: '',
    }
  },
  contests: {
    base: '/contests',
    detail: '/contests/:id',
    session: '/contests/:id/session',
    problems: '/contests/:id/problems',
    problemResultStats: '/contests/:id/problemResultStats',
    users: '/contests/:id/users',
    userDetail: '/contests/:id/users/:uid',
    ranklist: '/contests/:id/ranklist',
  },
  topics: {
    base: '/topics',
    detail: '/topics/:id',
    replies: '/topics/:id/replies'
  },
  replies: {
    base: '/replies',
  },
  tags: {
    base: '/tags',
  },
};

export default api;
