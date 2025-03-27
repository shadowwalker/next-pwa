// build-fallback-worker.js
'use strict';

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import { createWorkerWebpackConfig } from './webpack-worker-config.js';

/**
 * 根据 fallback 配置生成环境变量对象
 * @param {Object} params 参数对象
 * @param {Object} params.fallbacks - fallback 配置
 * @param {string} params.basedir - 项目根目录
 * @param {string} params.id - 构建 id
 * @param {Array} params.pageExtensions - 页面扩展名数组
 * @returns {Object|undefined} 环境变量对象或 undefined
 */
const getFallbackEnvs = ({ fallbacks, basedir, id, pageExtensions }) => {
  let { document, data } = fallbacks;

  if (!document) {
    let pagesDir;
    const candidate1 = path.join(basedir, 'pages');
    const candidate2 = path.join(basedir, 'src', 'pages');
    if (fs.existsSync(candidate1)) {
      pagesDir = candidate1;
    } else if (fs.existsSync(candidate2)) {
      pagesDir = candidate2;
    }
    if (!pagesDir) return;
    const offlines = pageExtensions
      .map(ext => path.join(pagesDir, `_offline.${ext}`))
      .filter(entry => fs.existsSync(entry));
    if (offlines.length === 1) {
      document = '/_offline';
    }
  }

  if (data && data.endsWith('.json')) {
    data = path.posix.join('/_next/data', id, data);
  }

  const envs = {
    __PWA_FALLBACK_DOCUMENT__: document || false,
    __PWA_FALLBACK_IMAGE__: fallbacks.image || false,
    __PWA_FALLBACK_AUDIO__: fallbacks.audio || false,
    __PWA_FALLBACK_VIDEO__: fallbacks.video || false,
    __PWA_FALLBACK_FONT__: fallbacks.font || false,
    __PWA_FALLBACK_DATA__: data || false
  };

  if (Object.values(envs).filter(v => !!v).length === 0) return;

  console.log('> [PWA] Fallback to precache routes when fetch failed from cache or network:');
  if (envs.__PWA_FALLBACK_DOCUMENT__) console.log(`> [PWA]   document (page): ${envs.__PWA_FALLBACK_DOCUMENT__}`);
  if (envs.__PWA_FALLBACK_IMAGE__) console.log(`> [PWA]   image: ${envs.__PWA_FALLBACK_IMAGE__}`);
  if (envs.__PWA_FALLBACK_AUDIO__) console.log(`> [PWA]   audio: ${envs.__PWA_FALLBACK_AUDIO__}`);
  if (envs.__PWA_FALLBACK_VIDEO__) console.log(`> [PWA]   video: ${envs.__PWA_FALLBACK_VIDEO__}`);
  if (envs.__PWA_FALLBACK_FONT__) console.log(`> [PWA]   font: ${envs.__PWA_FALLBACK_FONT__}`);
  if (envs.__PWA_FALLBACK_DATA__) console.log(`> [PWA]   data (/_next/data/**/*.json): ${envs.__PWA_FALLBACK_DATA__}`);

  return envs;
};

/**
 * 构建 fallback worker
 * @param {Object} options 构建选项
 * @param {string} options.id - 构建 id
 * @param {Object} options.fallbacks - fallback 配置
 * @param {string} options.basedir - 项目根目录
 * @param {string} options.destdir - 输出目录
 * @param {boolean} options.minify - 是否压缩代码
 * @param {Array} options.pageExtensions - 页面扩展名数组
 * @returns {Promise<Object|undefined>} 包含 name 和 precaches 的构建结果
 */
const buildFallbackWorker = async ({ id, fallbacks, basedir, destdir, minify, pageExtensions }) => {
  const envs = getFallbackEnvs({ fallbacks, basedir, id, pageExtensions });
  if (!envs) return;

  const name = `fallback-${id}.js`;
  const fallbackJs = path.join(__dirname, 'fallback.js');

  // 使用共享 webpack 配置打包 fallback worker
  const config = createWorkerWebpackConfig({
    entry: fallbackJs,
    destdir,
    filename: name,
    testRule: /\.js$/i,
    minify,
    extraPlugins: [new webpack.EnvironmentPlugin(envs)]
  });

  await new Promise((resolve, reject) => {
    webpack(config).run((error, status) => {
      if (error || status.hasErrors()) {
        console.error(`> [PWA] Failed to build fallback worker`);
        console.error(status ? status.toString({ colors: true }) : error);
        return reject(error || new Error('Webpack compilation errors'));
      }
      resolve();
    });
  });

  return { fallbacks, name, precaches: Object.values(envs).filter(v => !!v) };
};

export default buildFallbackWorker;
