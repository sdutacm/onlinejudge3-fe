const buildTarget =
  (process.env.NODE_ENV === 'production' ? process.env.OJ3_BUILD4 : '') || 'release';
console.log('Using build target:', buildTarget);
console.log('Using COMPETITION_SIDE:', process.env.COMPETITION_SIDE === '1');
process.env.CDN_URL && console.log('Using CDN_URL:', process.env.CDN_URL);
process.env.MEDIA_URL && console.log('Using MEDIA_URL:', process.env.MEDIA_URL);

const publicPathPrefix = process.env.CDN_URL || '';

const buildConfig = {
  release: {
    base: '/onlinejudge3/',
    publicPath: `${publicPathPrefix}/onlinejudge3/`,
    outputPath: './onlinejudge3',
  },
  // exp: {
  //   base: '/onlinejudge3_exp/',
  //   publicPath: `${publicPathPrefix}/onlinejudge3_exp/`,
  //   outputPath: './onlinejudge3_exp',
  // },
  // test: {
  //   base: '/onlinejudge3_test/',
  //   publicPath: `${publicPathPrefix}/onlinejudge3_test/`,
  //   outputPath: './onlinejudge3_test',
  // },
};

const usingBuildConfig = buildConfig[buildTarget];
const usingPublicPath = usingBuildConfig.publicPath;

export default {
  ...usingBuildConfig,
  hash: true,
  define: {
    'process.env.COMPETITION_SIDE': process.env.COMPETITION_SIDE === '1' ? '1' : '',
    'process.env.CDN_URL': process.env.CDN_URL || '',
    'process.env.MEDIA_URL': process.env.MEDIA_URL || '',
    'process.env.PUBLIC_PATH': process.env.NODE_ENV === 'production' ? usingPublicPath : '/',
    'process.env.DATA_USING_GIT': false,
  },
  plugins: [
    [
      'umi-plugin-react',
      {
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
          'ms-excel-suite-2022-customized-for-sdut_powered-by-ms-cn',
          'draw-some-higher-dimensions-shapes',
          'of-all-that-has-been-written_i-love-only-that-which-was-written-in-blood',
          'umi',
        ],
      },
    ],
  ],
  theme: {
    // 'primary-color': '#1e66d5', // dark
    'btn-border-radius-base': '100px',
    'btn-border-radius-sm': '100px',
    'success-color': '#4fb24f',
    'error-color': '#e23a36',
    'icon-url': '"/assets/fonts/iconfont"',
    'text-color': 'rgba(0, 0, 0, 0.75)',
    'code-family':
      'Monaco, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  proxy: {
    '/onlinejudge3/api/': {
      target: 'http://127.0.0.1:7001/',
      // target: 'https://acm.sdut.edu.cn/onlinejudge2/index.php/API_ng/',
      changeOrigin: true,
      pathRewrite: { '^/onlinejudge3/api/': '' },
    },
    '/image/': {
      target: 'http://127.0.0.1:7001/public/sf/',
      // target: 'https://acm.sdut.edu.cn/image/',
      changeOrigin: true,
      pathRewrite: {
        '^/image/': '',
      },
    },
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
        xlsx: {
          name: 'ms-excel-suite-2022-customized-for-sdut_powered-by-ms-cn',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](xlsx)[\\/]/,
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

    config.plugin('error-handling-plugin').use(class ErrorHandlingPlugin {
      apply(compiler) {
        // 编译失败时的错误
        compiler.hooks.failed.tap('ErrorHandlingPlugin', (error) => {
          console.error('Compiler failed:', error);
        });

        // 编译阶段的错误
        compiler.hooks.compilation.tap('ErrorHandlingPlugin', (compilation) => {
          // 模块构建失败的错误
          compilation.hooks.buildModule.tap('ErrorHandlingPlugin', (module) => {
            // 可以在这里处理模块构建阶段的错误
          });

          // 优化阶段的错误
          compilation.hooks.optimize.tap('ErrorHandlingPlugin', () => {
            // 可以在这里处理优化阶段的错误
          });

          // 处理资源生成阶段的错误
          compilation.hooks.afterSeal.tap('ErrorHandlingPlugin', () => {
            // 可以在这里处理资源生成阶段的错误
          });

          // 处理编译过程中的错误
          compilation.hooks.afterOptimizeAssets.tap('ErrorHandlingPlugin', (assets) => {
            // 可以在这里处理优化资源后的错误
          });

          // 处理编译过程中的警告
          compilation.hooks.afterOptimizeAssets.tap('ErrorHandlingPlugin', (assets) => {
            compilation.warnings.forEach((warning) => {
              // console.warn('Compilation warning:', warning);
            });
          });

          // 处理编译过程中的错误
          compilation.hooks.afterOptimizeAssets.tap('ErrorHandlingPlugin', (assets) => {
            compilation.errors.forEach((error) => {
              console.error('Compilation error:', error);
            });
          });
        });

        // 编译完成时的错误
        compiler.hooks.done.tap('ErrorHandlingPlugin', (stats) => {
          if (stats.hasErrors()) {
            console.error('Compilation completed with errors:');
            stats.toJson().errors.forEach((err) => {
              console.error(err);
            });
          }
          if (stats.hasWarnings()) {
            // console.warn('Compilation completed with warnings:');
            // stats.toJson().warnings.forEach((warning) => {
            //   console.warn(warning);
            // });
          }
        });
      }
    });

  },
};
