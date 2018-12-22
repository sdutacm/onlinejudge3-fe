const api = {
  base: '/api',
  general: {
    csrf: '/csrf',
  },
  session: {
    base: '/session',
    status: '/session',
    registerVerificationCode: '/register_email',
    register: '/register',
    forgotPassword: '/forgot_password',
    login: '/login',
    logout: '/session',
  },
  verifications: {
    code: '/verifications/code',
  },
  users: {
    base: '/users',
    detail: '/users/:id',
    password: '/users/:id/password',
    email: '/users/:id/email',
  },
  problems: {
    base: '/problems',
    detail: '/problems/:id',
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
  tags: {
    base: '/tags',
  },
};

export default api;
