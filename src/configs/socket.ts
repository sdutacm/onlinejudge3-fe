const isProd = process.env.NODE_ENV === 'production';

const socketConfig = {
  judger: {
    url: isProd ? '/io/judger' : 'http://127.0.0.1:7001/judger',
  },
};

export default socketConfig;
