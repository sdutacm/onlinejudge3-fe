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
    users: '/contests/:id/users',
    userDetail: '/contests/:id/users/:uid',
  },
  topics: {
    index: '/topics',
    detail: '/topics/:id',
  },
  posts: {
    index: '/posts',
    detail: '/posts/:id',
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
    stats: '/sets/:id/stats',
  },
  notes: {
    index: '/notes',
  },
  groups: {
    index: '/groups',
    detail: '/groups/:id',
  },
  admin: {
    index: '/admin',
    problems: '/admin/problems',
    tags: '/admin/tags',
    contests: '/admin/contests',
    contestHome: '/admin/contests/:id',
    contestUsers: '/admin/contests/:id/users',
    contestProblems: '/admin/contests/:id/problems',
    users: '/admin/users',
    posts: '/admin/posts',
    sets: '/admin/sets',
    groups: '/admin/groups',
    judger: '/admin/judger',
  },
  beta: '/beta',
  OJBK: '/OJBK',
};
