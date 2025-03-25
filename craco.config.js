/**
 * CRACO (Create React App Configuration Override) Configuration
 * 
 * This configuration file customizes the webpack build process for the application:
 * - Enables WebAssembly support for CML and CSL
 * - Configures polyfills for Node.js built-ins
 * - Sets up environment variables and global definitions
 * - Handles WASM file extensions and loading
 */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      // Enable experimental webpack features
      config.experiments = {
        asyncWebAssembly: true,  // Enable async WebAssembly loading
        topLevelAwait: true,     // Enable top-level await
        layers: true,            // Enable module layers
      }

      // Add polyfills for Node.js built-ins
      config.resolve.fallback = {
        stream: require.resolve("stream-browserify"),
      }

      // Configure WASM file handling for CML and CSL
      const wasmExtensionRegExp = /\.wasm$/;
      config.resolve.extensions.push('.wasm');
      
      // Exclude WASM files from asset/resource handling
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
        // Define global constants
        new webpack.DefinePlugin({
          BROWSER_RUNTIME: 1  // Indicate browser runtime environment
        }),
        // Provide polyfills for Node.js globals
        new webpack.ProvidePlugin({
          process: "process/browser",  // Browser-compatible process object
          Buffer: ['buffer', 'Buffer'], // Node.js Buffer polyfill
        }),
      ],
    },
  },
};
