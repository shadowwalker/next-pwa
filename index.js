// index.js
'use strict';

// 如果 self 不存在，则在 Node 环境中将其指向 global
if (typeof self === 'undefined') {
  global.self = global;
}

// 计算 __dirname（ESM 下没有内置 __dirname）
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import path from 'path';
import fs from 'fs';
import { globby } from 'globby'; // globby v14+ 使用命名导出
import crypto from 'crypto';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import defaultCache from './cache.js';
import buildCustomWorker from './build-custom-worker.js';
import buildFallbackWorker from './build-fallback-worker.js';


// 根据文件内容生成 revision 哈希
const getRevision = file =>
  crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex')

// 异步版本的 generateManifestEntriesAsync，将 public 文件夹中的文件生成预缓存 manifest 条目
// NOTE: 这是全量扫描版本，作为回退方案使用
async function generateManifestEntriesAsync({ basePath, sw, publicExcludes, additionalManifestEntries, buildId }) {
  if (Array.isArray(additionalManifestEntries)) return additionalManifestEntries
  const files = await globby([
    '**/*',
    '!workbox-*.js',
    '!workbox-*.js.map',
    '!worker-*.js',
    '!worker-*.js.map',
    '!fallback-*.js',
    '!fallback-*.js.map',
    `!${sw.replace(/^\/+/, '')}`,
    `!${sw.replace(/^\/+/, '')}.map`,
    ...publicExcludes
  ], { cwd: 'public' })

  return files.map(f => ({
    url: path.posix.join(basePath, `/${f}`),
    revision: getRevision(`public/${f}`)
  }))
}

/**
 * 增量生成 manifest 条目。
 * 如果缓存文件存在，则仅对比发生变化的文件，减少重复计算。
 * @param {Object} params
 * @param {string} params.basePath - URL 的基础路径
 * @param {string} params.sw - Service Worker 文件名（用于排除）
 * @param {Array} params.publicExcludes - 排除规则
 * @param {Array} params.additionalManifestEntries - 额外条目
 * @param {string} params.buildId - 当前构建 ID
 * @param {string} params.cacheFilePath - 缓存文件路径（例如：.next/manifest-cache.json）
 * @returns {Promise<Array>} manifest 条目数组
 */
async function generateManifestEntriesIncremental({
  basePath,
  sw,
  publicExcludes,
  additionalManifestEntries,
  buildId,
  cacheFilePath
}) {
  if (Array.isArray(additionalManifestEntries)) return additionalManifestEntries

  let cachedData = {}
  try {
    const content = fs.readFileSync(cacheFilePath, 'utf-8')
    cachedData = JSON.parse(content)
  } catch (e) {
    cachedData = {}
  }

  const files = await globby([
    '**/*',
    '!workbox-*.js',
    '!workbox-*.js.map',
    '!worker-*.js',
    '!worker-*.js.map',
    '!fallback-*.js',
    '!fallback-*.js.map',
    `!${sw.replace(/^\/+/, '')}`,
    `!${sw.replace(/^\/+/, '')}.map`,
    ...publicExcludes
  ], { cwd: 'public' })

  const manifestEntries = []
  const newCacheData = {}

  for (const f of files) {
    const filePath = path.join('public', f)
    const hash = getRevision(filePath)
    newCacheData[f] = { hash }
    // 如果缓存中该文件存在且 hash 没有变化，则复用旧的 hash，否则使用新计算的 hash
    const revision = cachedData[f] && cachedData[f].hash === hash ? cachedData[f].hash : hash
    manifestEntries.push({
      url: path.posix.join(basePath, `/${f}`),
      revision
    })
  }

  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(newCacheData, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing manifest cache file:', err)
  }

  return manifestEntries
}

// 默认的 URL 转换函数，允许对 manifest 条目进行统一转换
async function defaultTransform(manifestEntries, compilation, buildId) {
  const manifest = manifestEntries.map(m => {
    m.url = m.url
      .replace('/_next//static/image', '/_next/static/image')
      .replace('/_next//static/media', '/_next/static/media')
    if (m.revision === null) {
      let key = m.url
      if (key.startsWith(compilation.outputOptions.publicPath)) {
        key = m.url.substring(compilation.outputOptions.publicPath.length)
      }
      const asset = compilation.assetsInfo.get(key)
      m.revision = asset ? asset.contenthash || buildId : buildId
    }
    m.url = m.url.replace(/\[/g, '%5B').replace(/\]/g, '%5D')
    return m
  })
  return { manifest, warnings: [] }
}

export default (pluginOptions = {}) => (nextConfig = {}) =>
  Object.assign({}, nextConfig, {
    async webpack(config, options) {
      const {
        webpack,
        buildId,
        dev,
        config: {
          distDir = '.next',
          pageExtensions = ['tsx', 'ts', 'jsx', 'js', 'mdx'],
          experimental = {}
        }
      } = options

      // 基础路径配置（Next.js 默认 basePath 或 '/'）
      let basePath = options.config.basePath || '/'

      // Helper: 日志输出（根据 debug 选项控制详细度）
      const logDebug = (...args) => {
        if (pluginOptions.debug) {
          console.log(...args)
        }
      }

      // 解构插件配置，并设置默认值
      const {
        disable = false,
        register = true,
        dest = distDir,
        sw = 'sw.js',
        cacheStartUrl = true,
        dynamicStartUrl = true,
        dynamicStartUrlRedirect,
        skipWaiting = true,
        clientsClaim = true,
        cleanupOutdatedCaches = true,
        additionalManifestEntries,
        ignoreURLParametersMatching = [],
        importScripts = [],
        publicExcludes = ['!noprecache/**/*'],
        buildExcludes = [],
        modifyURLPrefix = {},
        // 用户自定义的 manifestTransforms 数组（可选）
        manifestTransforms: userManifestTransforms = [],
        // 允许用户完全覆盖默认 manifest 转换逻辑
        disableDefaultManifestTransform = false,
        fallbacks = {},
        cacheOnFrontEndNav = false,
        reloadOnOnline = true,
        scope = basePath,
        customWorkerDir = 'worker',
        subdomainPrefix, // 已废弃，建议使用 basePath
        // 新增：是否启用增量构建与 manifest 缓存，以及缓存文件路径
        enableIncrementalManifest = true,
        manifestCacheFile = path.join(options.dir, '.next', 'manifest-cache.json'),
        ...workbox
      } = pluginOptions

      // 调用 nextConfig 中自定义的 webpack 配置（如果存在）
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, options)
      }
      if (disable) {
        if (options.isServer) console.log('> [PWA] PWA support is disabled')
        return config
      }
      if (subdomainPrefix) {
        console.error(
          '> [PWA] subdomainPrefix is deprecated, use basePath in next.config.js instead: https://nextjs.org/docs/api-reference/next.config.js/basepath'
        )
      }
      console.log(`> [PWA] Compile ${options.isServer ? 'server' : 'client (static)'}`)

      let { runtimeCaching = defaultCache } = pluginOptions
      const _scope = path.posix.join(scope, '/')
      const _sw = path.posix.join(basePath, sw.startsWith('/') ? sw : `/${sw}`)

      // 注入全局变量到 main.js
      config.plugins.push(
        new webpack.DefinePlugin({
          __PWA_SW__: `'${_sw}'`,
          __PWA_SCOPE__: `'${_scope}'`,
          __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
          __PWA_START_URL__: dynamicStartUrl ? `'${basePath}'` : undefined,
          __PWA_CACHE_ON_FRONT_END_NAV__: `${Boolean(cacheOnFrontEndNav)}`,
          __PWA_RELOAD_ON_ONLINE__: `${Boolean(reloadOnOnline)}`
        })
      )

      // 自动将 register.js 注入到 main.js 的入口中
const registerJs = path.join(__dirname, 'register.js');
if (fs.existsSync(registerJs)) {
  const entry = config.entry;
  config.entry = () =>
    entry().then(entries => {
      if (entries['main.js'] && !entries['main.js'].includes(registerJs)) {
        entries['main.js'].unshift(registerJs);
      }
      return entries;
    });
} else {
  console.warn('> [PWA] register.js not found; skipping auto registration.');
}


if (!options.isServer) {
  const _dest = path.join(options.dir, dest);

    // 根据需要将起始 URL 添加到 manifestEntries 中……
    if (cacheStartUrl) {
      if (!dynamicStartUrl) {
        manifestEntries.push({
          url: basePath,
          revision: buildId
        });
      } else if (typeof dynamicStartUrlRedirect === 'string' && dynamicStartUrlRedirect.length > 0) {
        manifestEntries.push({
          url: dynamicStartUrlRedirect,
          revision: buildId
        });
      }
    }


        // 构建自定义 worker（等待编译完成）
        let customWorkerScriptName
        try {
          customWorkerScriptName = await buildCustomWorker({
            id: buildId,
            basedir: options.dir,
            customWorkerDir,
            destdir: _dest,
            plugins: config.plugins.filter(plugin => plugin instanceof webpack.DefinePlugin),
            minify: !dev
          })
        } catch (err) {
          console.error('Error building custom worker:', err)
        }
        if (customWorkerScriptName) {
          importScripts.unshift(customWorkerScriptName)
        }

        if (register) {
          console.log(`> [PWA] Auto register service worker with: ${path.resolve(registerJs)}`)
        } else {
          console.log(
            '> [PWA] Auto register service worker is disabled, please call window.workbox.register() in your component'
          )
        }
        console.log(`> [PWA] Service worker: ${path.join(_dest, sw)}`)
        console.log(`> [PWA]   url: ${_sw}`)
        console.log(`> [PWA]   scope: ${_scope}`)

        config.plugins.push(
          new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
              path.join(_dest, 'workbox-*.js'),
              path.join(_dest, 'worker-*.js.LICENSE.txt'),
              path.join(_dest, 'workbox-*.js.map'),
              path.join(_dest, sw),
              path.join(_dest, `${sw}.map`)
            ]
          })
        )

  // 如果处于开发模式，则跳过复杂的 precaching 逻辑
  if (dev) {
    console.log('> [PWA] Development mode: caching is disabled; using NetworkOnly strategy.');
    ignoreURLParametersMatching.push(/ts/);
    runtimeCaching = [
      {
        urlPattern: /.*/i,
        handler: 'NetworkOnly',
        options: { cacheName: 'dev' }
      }
    ];
  } else {
    // 生产环境：继续构建 precaching manifest、fallback worker 等
        // 生成 manifest 条目，支持增量构建
    let manifestEntries;
    if (enableIncrementalManifest) {
      manifestEntries = await generateManifestEntriesIncremental({
        basePath,
        sw,
        publicExcludes,
        additionalManifestEntries,
        buildId,
        cacheFilePath: manifestCacheFile
      });
    } else {
      manifestEntries = await generateManifestEntriesAsync({
        basePath,
        sw,
        publicExcludes,
        additionalManifestEntries,
        buildId
      });
    }
   }
        // 如果需要缓存起始 URL，则添加到 manifestEntries 中
        if (cacheStartUrl) {
          if (!dynamicStartUrl) {
            manifestEntries.push({
              url: basePath,
              revision: buildId
            })
          } else if (typeof dynamicStartUrlRedirect === 'string' && dynamicStartUrlRedirect.length > 0) {
            manifestEntries.push({
              url: dynamicStartUrlRedirect,
              revision: buildId
            })
          }
        }

        // 处理 fallback worker（等待编译完成）
    let _fallbacks = fallbacks;
    try {
      if (_fallbacks) {
        const res = await buildFallbackWorker({
          id: buildId,
          fallbacks,
          basedir: options.dir,
          destdir: _dest,
          minify: !dev,
          pageExtensions
        });
        if (res) {
          _fallbacks = res.fallbacks;
          importScripts.unshift(res.name);
          res.precaches.forEach(route => {
            if (!manifestEntries.find(entry => entry.url.startsWith(route))) {
              manifestEntries.push({
                url: route,
                revision: buildId
              });
            }
          });
        } else {
          _fallbacks = undefined;
        }
      }
    } catch (err) {
      console.error('Error building fallback worker:', err);
    }

        // 合并用户自定义的 manifestTransforms 与默认转换函数
        const combinedManifestTransforms = disableDefaultManifestTransform
          ? [...userManifestTransforms]
          : [
              ...userManifestTransforms,
              async (entries, compilation) => await defaultTransform(entries, compilation, buildId)
            ]

        // 定义 Workbox 通用配置
        const workboxCommon = {
          swDest: path.join(_dest, sw),
          additionalManifestEntries: dev ? [] : manifestEntries,
          exclude: [
            ...buildExcludes,
            ({ asset, compilation }) => {
              if (
                asset.name.startsWith('server/') ||
                asset.name.match(/^(build-manifest\.json|react-loadable-manifest\.json)$/)
              ) {
                return true
              }
              if (dev && !asset.name.startsWith('static/runtime/')) {
                return true
              }
              if (experimental.modern) {
                if (asset.name.endsWith('.module.js')) return false
                if (asset.name.endsWith('.js')) return true
              }
              return false
            }
          ],
          modifyURLPrefix: {
            ...modifyURLPrefix,
            '/_next/../public/': '/'
          },
          manifestTransforms: combinedManifestTransforms
        }

        // 根据是否使用自定义 Service Worker 源文件分为两种模式
        if (workbox.swSrc) {
          const swSrc = path.join(options.dir, workbox.swSrc)
          console.log(`> [PWA] Inject manifest in ${swSrc}`)
          config.plugins.push(
            new WorkboxPlugin.InjectManifest({
              ...workboxCommon,
              ...workbox,
              swSrc
            })
          )
        } else {
          if (dev) {
            console.log('> [PWA] Develop mode: caching is disabled for offline support; using NetworkOnly strategy.')
            ignoreURLParametersMatching.push(/ts/)
            runtimeCaching = [
              {
                urlPattern: /.*/i,
                handler: 'NetworkOnly',
                options: { cacheName: 'dev' }
              }
            ]
          }
          if (dynamicStartUrl) {
            runtimeCaching.unshift({
              urlPattern: basePath,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'start-url',
                plugins: [
                  {
                    cacheWillUpdate: async ({ request, response }) => {
                      if (response && response.type === 'opaqueredirect') {
                        return new Response(response.body, {
                          status: 200,
                          statusText: 'OK',
                          headers: response.headers
                        })
                      }
                      return response
                    }
                  }
                ]
              }
            })
          }
          if (_fallbacks) {
            runtimeCaching.forEach(c => {
              if (!c.options.plugins) c.options.plugins = []
              c.options.plugins.push({
                handlerDidError: async ({ request }) => self.fallback(request)
              })
            })
          }
          config.plugins.push(
            new WorkboxPlugin.GenerateSW({
              ...workboxCommon,
              skipWaiting,
              clientsClaim,
              cleanupOutdatedCaches,
              ignoreURLParametersMatching,
              importScripts,
              ...workbox,
              runtimeCaching
            })
          )
        }
      }

      return config
    }
  })
