// build-custom-worker.js
'use strict';

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import { createWorkerWebpackConfig } from './webpack-worker-config.js';

/**
 * 构建自定义 Service Worker
 * @param {Object} options 构建选项
 * @param {string} options.id - 构建 id
 * @param {string} options.basedir - 项目根目录
 * @param {string} options.customWorkerDir - 自定义 worker 目录（相对于 basedir）
 * @param {string} options.destdir - 输出目录
 * @param {Array} options.plugins - 额外的 webpack 插件
 * @param {boolean} options.minify - 是否压缩代码
 * @returns {Promise<string|undefined>} 构建成功返回生成的文件名，否则返回 undefined
 */
const buildCustomWorker = async ({ id, basedir, customWorkerDir, destdir, plugins, minify }) => {
  // 寻找自定义 worker 目录：先在 basedir 下，再在 basedir/src 下查找
  let workerDir;
  const candidate1 = path.join(basedir, customWorkerDir);
  const candidate2 = path.join(basedir, 'src', customWorkerDir);
  if (fs.existsSync(candidate1)) {
    workerDir = candidate1;
  } else if (fs.existsSync(candidate2)) {
    workerDir = candidate2;
  }
  if (!workerDir) return;

  const name = `worker-${id}.js`;
  // 检查入口文件 index.ts 或 index.js
  const customWorkerEntries = ['ts', 'js']
    .map(ext => path.join(workerDir, `index.${ext}`))
    .filter(entry => fs.existsSync(entry));

  if (customWorkerEntries.length === 0) return;
  if (customWorkerEntries.length > 1) {
    console.warn(
      `> [PWA] WARNING: More than one custom worker found (${customWorkerEntries.join(
        ','
      )}), not building a custom worker`
    );
    return;
  }
  const customWorkerEntry = customWorkerEntries[0];
  console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`);
  console.log(`> [PWA] Build custom worker: ${path.join(destdir, name)}`);

  // 使用共享 webpack 配置打包 custom worker
  const config = createWorkerWebpackConfig({
    entry: customWorkerEntry,
    destdir,
    filename: name,
    testRule: /\.(t|j)s$/i,
    minify,
    extraPlugins: plugins
  });

  // 使用 Promise 封装 webpack.run
  await new Promise((resolve, reject) => {
    webpack(config).run((error, status) => {
      if (error || status.hasErrors()) {
        console.error(`> [PWA] Failed to build custom worker`);
        console.error(status ? status.toString({ colors: true }) : error);
        return reject(error || new Error('Webpack compilation errors'));
      }
      resolve();
    });
  });

  return name;
};

export default buildCustomWorker;
