'use strict'

const path = require('path')
const fs = require('fs')
const globby = require('globby')
const crypto = require('crypto')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const defaultCache = require('./cache')

const getRevision = file => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      webpack,
      buildId,
      dev,
      config: { distDir = '.next', pwa = {}, experimental = {}}
    } = options

    let basePath = options.config.basePath ?? '/'
    if (!basePath) basePath = '/'

    // For workbox configurations:
    // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW
    const {
      disable = false,
      register = true,
      dest = distDir,
      sw = 'sw.js',
      dynamicStartUrl = true,
      skipWaiting = true,
      clientsClaim = true,
      cleanupOutdatedCaches = true,
      additionalManifestEntries,
      ignoreURLParametersMatching = [],
      importScripts = [],
      publicExcludes = [],
      buildExcludes = [],
      manifestTransforms = [],
      modifyURLPrefix = {},
      subdomainPrefix,  // deprecated, use basePath in next.config.js instead
      ...workbox
    } = pwa

    if (subdomainPrefix !== undefined) {
      console.error('> [PWA] subdomainPrefix is deprecated, use basePath in next.config.js instead: https://nextjs.org/docs/api-reference/next.config.js/basepath')
    }

    let { runtimeCaching = defaultCache, scope = basePath } = pwa
    scope = path.posix.join(scope, '/')

    // mitigate Chrome 89 auto offline check issue
    // blog: https://developer.chrome.com/blog/improved-pwa-offline-detection/ 
    // issue: https://github.com/GoogleChrome/workbox/issues/2749
    // if (dynamicStartUrl) {
    //   runtimeCaching.unshift({
    //     urlPattern: basePath,
    //     handler: 'CacheFirst',
    //     options: {
    //       cacheName: 'start-url',
    //       expiration: {
    //         maxEntries: 1,
    //         maxAgeSeconds: 1  // 1s ~= NetworkFirst
    //       }
    //     }
    //   })
    // }

    if (typeof nextConfig.webpack === 'function') {
      config = nextConfig.webpack(config, options)
    }

    if (disable) {
      options.isServer && console.log('> [PWA] PWA support is disabled')
      return config
    }

    console.log(`> [PWA] Compile ${options.isServer ? 'server' : 'client (static)'}`)

    // inject register script to main.js
    const _sw = path.posix.join(basePath, sw.startsWith('/') ? sw : `/${sw}`)
    config.plugins.push(
      new webpack.DefinePlugin({
        __PWA_SW__: `'${_sw}'`,
        __PWA_SCOPE__: `'${scope}'`,
        __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
        __PWA_START_URL__: dynamicStartUrl ? `'${basePath}'` : undefined
      })
    )

    const registerJs = path.join(__dirname, 'register.js')
    const entry = config.entry
    config.entry = () =>
      entry().then(entries => {
        if (entries['main.js'] && !entries['main.js'].includes(registerJs)) {
          entries['main.js'].unshift(registerJs)
        }
        return entries
      })

    if (!options.isServer) {
      if (dev) {
        console.log(
          '> [PWA] Build in develop mode, cache and precache are mostly disabled. This means offline support is disabled, but you can continue developing other functions in service worker.'
        )
      }

      if (register) {
        console.log(`> [PWA] Auto register service worker with: ${path.resolve(registerJs)}`)
      } else {
        console.log(
          `> [PWA] Auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook`
        )
        console.log(`> [PWA]   window.workbox.register()`)
      }

      const _dest = path.join(options.dir, dest)

      console.log(`> [PWA] Service worker: ${path.join(_dest, sw)}`)
      console.log(`> [PWA]   url: ${_sw}`)
      console.log(`> [PWA]   scope: ${scope}`)

      // build custom script into service worker
      const customWorkerEntries = ['js', 'ts']
        .map((extension) =>
          path.join(options.dir, 'worker', `index.${extension}`)
        )
        .filter((entry) => fs.existsSync(entry))

      const customWorkerName = `worker-${buildId}.js`
      if (customWorkerEntries.length === 1) {
        const customWorkerEntry = customWorkerEntries.pop()
        console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`)
        console.log(`> [PWA] Build custom worker: ${path.join(_dest, customWorkerName)}`)
        webpack({
          mode: config.mode,
          target: 'webworker',
          entry: customWorkerEntry,
          resolve: {
            extensions: ['.ts', '.js'],
          },
          module: {
            rules: [
              {
                test: /\.(j|t)s$/i,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [['next/babel', {
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
                      }]],
                    },
                  },
                ],
              },
            ],
          },
          output: {
            path: _dest,
            filename: customWorkerName
          },
          plugins: [
            new CleanWebpackPlugin({
              cleanOnceBeforeBuildPatterns: [path.join(_dest, 'worker-*.js'), path.join(_dest, 'worker-*.js.map')]
            })
          ].concat(config.plugins.filter(plugin => plugin instanceof webpack.DefinePlugin))
        }).run((error, status) => {
          if (error || status.hasErrors()) {
            console.error(`> [PWA] Failed to build custom worker`)
            console.error(status.toString({ colors: true }))
            process.exit(-1)
          }
          importScripts.unshift(customWorkerName)
        })
      }

      config.plugins.push(
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            path.join(_dest, 'workbox-*.js'),
            path.join(_dest, 'workbox-*.js.map'),
            path.join(_dest, sw),
            path.join(_dest, `${sw}.map`)
          ]
        })
      )

      // precache files in public folder
      let manifestEntries = additionalManifestEntries
      if (!Array.isArray(manifestEntries)) {
        manifestEntries = globby
          .sync(
            [
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
            ],
            {
              cwd: 'public'
            }
          )
          .map(f => ({
            url: path.posix.join(basePath, `/${f}`),
            revision: getRevision(`public/${f}`)
          }))
      }

      if (!dynamicStartUrl) {
        manifestEntries.push({
          url: basePath,
          revision: buildId
        })
      }

      const prefix = config.output.publicPath ? `${config.output.publicPath}static/` : 'static/'
      const workboxCommon = {
        swDest: path.join(_dest, sw),
        additionalManifestEntries: dev ? [] : manifestEntries,
        exclude: [
          ({ asset, compilation }) => {
            if (asset.name.match(/^(build-manifest\.json|react-loadable-manifest\.json)$/)) {
              return true
            }
            if (dev && !asset.name.startsWith('static/runtime/')) {
              return true
            }
            if (experimental.modern /* modern */) {
              if (asset.name.endsWith('.module.js')) {
                return false
              }
              if (asset.name.endsWith('.js')) {
                return true
              }
            }
            return false
          },
          ...buildExcludes
        ],
        modifyURLPrefix: {
          ...modifyURLPrefix,
          [prefix]: path.posix.join(basePath, '/_next/static/')
        },
        manifestTransforms: [
          ...manifestTransforms,
          async (manifestEntries, compilation) => {
            const manifest = manifestEntries.map(m => {
              m.url = m.url.replace(/\/\[/g, '/%5B').replace(/\]/g, '%5D')
              m.revision = buildId
              return m
            })
            return { manifest, warnings: [] }
          }
        ]
      }

      if (workbox.swSrc) {
        const swSrc = path.join(options.dir, workbox.swSrc)
        console.log('> [PWA] Inject manifest in', swSrc)
        config.plugins.push(
          new WorkboxPlugin.InjectManifest({
            ...workboxCommon,
            ...workbox,
            swSrc
          })
        )
      } else {
        if (dev) {
          ignoreURLParametersMatching.push(/ts/)
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
            runtimeCaching: dev
              ? [
                  {
                    urlPattern: /.*/i,
                    handler: 'NetworkOnly',
                    options: {
                      cacheName: 'dev'
                    }
                  }
                ]
              : runtimeCaching
          })
        )
      }
    }

    return config
  }
})
