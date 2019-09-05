export default {
  base: '/onlinejudge3_beta/',
  publicPath: '/onlinejudge3_beta/',
  outputPath: './onlinejudge3_beta',
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
      target: 'http://localhost:8848/index.php/API_ng/',
      changeOrigin: true,
      pathRewrite: { '^/onlinejudge2/index.php/API_ng/' : '' }
    },
    '/image/': {
      target: 'http://localhost:8848/dev_images/',
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
