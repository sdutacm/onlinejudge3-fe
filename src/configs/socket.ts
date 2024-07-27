const isProd = process.env.NODE_ENV === 'production';

const socketConfig = {
  path: '/onlinejudge3/socket.io',
  judger: {
    url: '/judger',
  },
};

export default socketConfig;
