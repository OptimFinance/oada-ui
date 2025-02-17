const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      config.experiments = {
        asyncWebAssembly: true,
        topLevelAwait: true,
        layers: true,
      }

      config.resolve.fallback = {
        stream: require.resolve("stream-browserify"),
      }
      // cargo-culting for CML and CSL
      const wasmExtensionRegExp = /\.wasm$/;
      config.resolve.extensions.push('.wasm');
      config.module.rules.forEach((rule) => {
          (rule.oneOf || []).forEach((oneOf) => {
              if (oneOf.type === "asset/resource") {
                  oneOf.exclude.push(wasmExtensionRegExp);
              }
          });
      });

      return config;
    },
    plugins: {
      add: [
        new webpack.DefinePlugin({
          BROWSER_RUNTIME: 1
        }),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};
