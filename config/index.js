'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const host = '100.100.100.102'
// const host = '129.28.103.85'
// const host = '192.168.1.100'

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/mediaex': {
        target: 'http://' + host + ':8000/mediaex',
        changeOrigin: true,
        pathRewrite: {
          '^/mediaex': ''
        }
      },
      '/dlpath': {
        target: 'http://' + host + ':8000/tools/dlpath',
        changeOrigin: true,
        pathRewrite: {
          '^/dlpath': ''
        }
      },
      '/tools': {
        target: 'http://' + host + ':8000/tools/',
        changeOrigin: true,
        pathRewrite: {
          '^/tools': ''
        }
      },
      '/data': {
        target: 'http://' + host + ':8000/tools/data',
        changeOrigin: true,
        pathRewrite: {
          '^/data': ''
        }
      },
      '/php': {
        target: 'http://' + host + ':8000/tools/php',
        changeOrigin: true,
        pathRewrite: {
          '^/php': ''
        }
      },
      '/base': {
        target: 'http://' + host + ':8000/base',
        changeOrigin: true,
        pathRewrite: {
          '^/base': ''
        }
      },
      '/media': {
        target: 'http://' + host + ':8000/media',
        changeOrigin: true,
        pathRewrite: {
          '^/media': ''
        }
      },
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
