const isProd = process.env.NODE_ENV === 'production';

const socketConfig = {
  judger: {
    url: isProd ? '/judger' : 'http://127.0.0.1:7002/judger',
  },
};

export default socketConfig;
