const api = {
  base: '/api2',
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
    emailCode: '/verifications/email_code',
  },
  users: {
    base: '/users',
    one: '/users/:id',
  },
  problems: {
    base: '/problems',
    one: '/problems/:id',
  },
  solutions: {
    base: '/solutions',
    one: '/solutions/:id',
  },
  contest: {
    acm: {
      index: '/set/',
      problem: '/set_problem/',
      submit: '/submit',
      status: '',
    }
  },
};

export default api;
