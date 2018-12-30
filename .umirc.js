export default {
  plugins: [
    ['umi-plugin-react', {
      dva: {
        immer: true,
      },
      antd: true,
      routes: {
        exclude: [/models\//],
      },
      hardSource: true,
      title: 'SDUT OnlineJudge',
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
    '/api/': {
      target: 'http://localhost:8848/index.php/API_ng/',
      changeOrigin: true,
      pathRewrite: { '^/api/' : '' }
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
