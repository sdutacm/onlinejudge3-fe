const api = {
  // base: '/api',
  base: process.env.OJ3_BUILD4 === 'test' ? '/onlinejudge3/api_test' : '/onlinejudge3/api',
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
    email: '/users/:id/email',
    avatar: '/users/:id/avatar',
    bannerImage: '/users/:id/bannerImage',
    problemResultStats: '/users/:id/problemResultStats',
    solutionCalendar: '/users/:id/solutionCalendar',
    solutionStats: '/users/:id/solutionStats',
    ratingHistory: '/users/:id/ratingHistory',
    favorites: '/users/:id/favorites',
    notes: '/users/:id/notes',
    groups: '/users/:id/groups',
  },
  problems: {
    base: '/problems',
    detail: '/problems/:id',
    tags: '/problems/:id/tags',
    difficulty: '/problems/:id/difficulty',
  },
  solutions: {
    base: '/solutions',
    detail: '/solutions/:id',
    shared: '/solutions/:id/shared',
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
    end: '/contests/:id/end',
    ratingStatus: '/contests/:id/ratingStatus',
  },
  topics: {
    base: '/topics',
    detail: '/topics/:id',
    replies: '/topics/:id/replies',
  },
  replies: {
    base: '/replies',
  },
  posts: {
    base: '/posts',
    detail: '/posts/:id',
  },
  tags: {
    base: '/tags',
  },
  messages: {
    base: '/messages',
    detail: '/messages/:id',
  },
  favorites: {
    base: '/favorites',
    detail: '/favorites/:id',
  },
  sets: {
    base: '/sets',
    detail: '/sets/:id',
  },
  notes: {
    base: '/notes',
    detail: '/notes/:id',
  },
  groups: {
    base: '/groups',
    detail: '/groups/:id',
    members: {
      base: '/groups/:id/members',
      detail: '/groups/:id/members/:uid',
    },
  },
  common: {
    base: '/common',
    media: '/common/media',
  },
  stats: {
    base: '/stats',
    userACRank: '/stats/userACRank',
    userAcceptedProblems: '/stats/userAcceptedProblems',
    userSubmittedProblems: '/stats/userSubmittedProblems',
  },
};

export default api;
