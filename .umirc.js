const buildTarget = (process.env.NODE_ENV === 'production' ? process.env.OJ3_BUILD4 : '') || 'release';
console.log('Using build target:', buildTarget);

const buildConfig = {
  release: {
    base: '/onlinejudge3/',
    publicPath: '/onlinejudge3/',
    outputPath: './onlinejudge3',
  },
  exp: {
    base: '/onlinejudge3_exp/',
    publicPath: '/onlinejudge3_exp/',
    outputPath: './onlinejudge3_exp',
  },
  test: {
    base: '/onlinejudge3_barkalways/',
    publicPath: '/onlinejudge3_barkalways/',
    outputPath: './onlinejudge3_barkalways',
  },
};

export default {
  ...buildConfig[buildTarget],
  hash: true,
  plugins: [
    ['umi-plugin-react', {
      dva: {
        immer: true,
      },
      antd: true,
      routes: {
        exclude: [/models\//],
      },
      title: {
        defaultTitle: 'SDUT OnlineJudge',
        separator: '|',
        format: '{current} {separator} {parent}',
      },
    }],
  ],
  theme: {
    // 'primary-color': '#1e66d5', // dark
    'btn-border-radius-base': '100px',
    'btn-border-radius-sm': '100px',
    'success-color': '#4fb24f',
    'error-color': '#e23a36',
    'icon-url': '"/assets/fonts/iconfont"',
  },
  proxy: {
    '/onlinejudge2/index.php/API_ng/': {
      // target: 'http://127.0.0.1:8848/index.php/API_ng/',
      target: 'https://acm.sdut.edu.cn/onlinejudge2/index.php/API_ng/',
      changeOrigin: true,
      pathRewrite: { '^/onlinejudge2/index.php/API_ng/' : '' }
    },
    '/image/': {
      // target: 'http://127.0.0.1:8848/dev_images/',
      target: 'https://acm.sdut.edu.cn/image/',
      changeOrigin: true,
      pathRewrite: {
        '^/image/': ''
      }
    }
  },
  urlLoaderExcludes: [/\.svg$/],
  chainWebpack(config) {
    config.module
      .rule('svg')
      .test(/\.svg(\?v=\d+\.\d+\.\d+)?$/)
      .use([
        {
          loader: 'babel-loader',
        },
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true,
          },
        },
      ])
      .loader(require.resolve('@svgr/webpack'));
  },
};
