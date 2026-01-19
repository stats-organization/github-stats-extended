const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      dotenv: path.resolve(__dirname, 'src/dotenv-browser-stub.js'),
      '../src/fetchers/wakatime.js': path.resolve(__dirname, 'src/wakatime-override.js'),
    },

    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        pg: false,
        path: require.resolve('path-browserify'),
        querystring: require.resolve('querystring-es3'),
        url: require.resolve('url/'),
        http: require.resolve('stream-http'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        fs: false,
        net: false,
      };

      // remove the DefinePlugin, which (only) replaces process.env in code
      webpackConfig.plugins = webpackConfig.plugins.filter(
        function (plugin) {
          let isDefinePlugin = plugin instanceof webpack.DefinePlugin;
          if (isDefinePlugin) {
            console.log("filtered plugin:", plugin);
          }
          return !isDefinePlugin;
        }
      );

      return webpackConfig;
    },
  },
};
