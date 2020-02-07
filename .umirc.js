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
        exclude: [/models\//, /services\//],
      },
      title: {
        defaultTitle: 'SDUT OnlineJudge',
        separator: '|',
        format: '{current} {separator} {parent}',
      },
      dynamicImport: null,
      chunks: [
        'vendors',
        'raincloud',
        'ui',
        'time-is-money',
        'talk-is-cheap',
        'mathematics-is-the-queen-of-the-sciences',
        'draw-some-higher-dimensions-shapes',
        'of-all-that-has-been-written_i-love-only-that-which-was-written-in-blood',
        'umi',
      ],
    }],
  ],
  theme: {
    // 'primary-color': '#1e66d5', // dark
    'btn-border-radius-base': '100px',
    'btn-border-radius-sm': '100px',
    'success-color': '#4fb24f',
    'error-color': '#e23a36',
    'icon-url': '"/assets/fonts/iconfont"',
    'text-color': 'rgba(0, 0, 0, 0.75)',
    'code-family': 'Monaco, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  proxy: {
    '/onlinejudge2/index.php/API_ng/': {
      target: 'http://127.0.0.1:8848/index.php/API_ng/',
      // target: 'https://acm.sdut.edu.cn/onlinejudge2/index.php/API_ng/',
      changeOrigin: true,
      pathRewrite: { '^/onlinejudge2/index.php/API_ng/' : '' }
    },
    '/image/': {
      target: 'http://127.0.0.1:8848/dev_images/',
      // target: 'https://acm.sdut.edu.cn/image/',
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

    config.optimization.splitChunks({
      // chunks: 'async',
      // minSize: 30000,
      // maxSize: 0,
      // minChunks: 1,
      maxAsyncRequests: 15,
      maxInitialRequests: 15,
      // automaticNameDelimiter: '.',
      // name: true,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test({ resource }) {
            return /[\\/]node_modules[\\/]/.test(resource);
          },
          priority: 10,
        },
        raincloud: {
          name: 'raincloud',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|axios|lodash|immutable)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        antd: {
          name: 'ui',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        moment: {
          name: 'time-is-money',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](moment)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        highlight: {
          name: 'talk-is-cheap',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](highlight\.js)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        katex: {
          name: 'mathematics-is-the-queen-of-the-sciences',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](katex)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        highcharts: {
          name: 'draw-some-higher-dimensions-shapes',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](highcharts)[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        braftEditor: {
          name: 'of-all-that-has-been-written_i-love-only-that-which-was-written-in-blood',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](braft(-|\w+)(\w*)|draft(-|\w+)(\w*))[\\/]/,
          minSize: 0,
          minChunks: 1,
          priority: 100,
        },
        // 'async-commons': {
        //   chunks: 'async',
        //   minChunks: 2,
        //   name: 'async-commons',
        //   priority: 90,
        // },
      },
    });
  },
};
