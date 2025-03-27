// webpack-worker-config.js
'use strict';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// 定义默认的 Node 内置模块回退配置，确保打包环境为 webworker
const defaultFallbacks = {
  module: false,
  dgram: false,
  dns: false,
  path: false,
  fs: false,
  os: false,
  crypto: false,
  stream: false,
  http2: false,
  net: false,
  tls: false,
  zlib: false,
  child_process: false
};

/**
 * 创建用于打包 worker 的通用 webpack 配置
 * @param {Object} options 配置项
 * @param {string} options.entry - 入口文件路径
 * @param {string} options.destdir - 输出目录
 * @param {string} options.filename - 输出文件名
 * @param {RegExp} options.testRule - babel-loader 应用的正则规则
 * @param {boolean} options.minify - 是否压缩代码
 * @param {Array} [options.extraPlugins=[]] - 额外的 webpack 插件
 * @param {Array} [options.extraExtensions=[]] - 额外的 resolve.extensions
 * @param {Object} [options.customFallbacks={}] - 用户自定义 fallback 配置，覆盖默认 fallback
 * @param {Object} [options.babelOptions={}] - 用户自定义 babel-loader 配置，合并默认配置
 * @returns {Object} webpack 配置对象
 */
export function createWorkerWebpackConfig({
  entry,
  destdir,
  filename,
  testRule,
  minify,
  extraPlugins = [],
  extraExtensions = [],
  customFallbacks = {},
  babelOptions = {}
}) {
  const mergedFallbacks = Object.assign({}, defaultFallbacks, customFallbacks);
  const defaultBabelOptions = {
    presets: [
      [
        'next/babel',
        {
          'transform-runtime': {
            corejs: false,
            helpers: true,
            regenerator: false,
            useESModules: true
          },
          'preset-env': {
            modules: false,
            targets: 'chrome >= 56'
          }
        }
      ]
    ]
  };

  return {
    mode: 'none',
    target: 'webworker',
    entry: { main: entry },
    resolve: {
      extensions: [...extraExtensions, '.ts', '.js'],
      fallback: mergedFallbacks
    },
    module: {
      rules: [
        {
          test: testRule,
          use: [
            {
              loader: 'babel-loader',
              options: { ...defaultBabelOptions, ...babelOptions }
            }
          ]
        }
      ]
    },
    output: {
      path: destdir,
      filename: filename
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...extraPlugins
    ],
    optimization: minify
      ? {
          minimize: true,
          minimizer: [new TerserPlugin()]
        }
      : undefined
  };
}
