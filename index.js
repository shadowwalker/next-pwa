'use strict'

const path = require('path')
const fs = require('fs')
const globby = require('globby')
const crypto = require('crypto')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const defaultCache = require('./cache')
const { exit } = require('process')
const log = require('./log')

const getRevision = file => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      webpack,
      buildId,
      dev,
      config: { distDir = '.next', pwa = {}, experimental = {} /*, modern = false*/ }
    } = options

    // For workbox configurations:
    // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW
    const {
      disable = false,
      register = true,
      dest = distDir,
      sw = 'sw.js',
      subdomainPrefix = '',
      scope = '/',
      skipWaiting = true,
      clientsClaim = true,
      cleanupOutdatedCaches = true,
      additionalManifestEntries,
      ignoreURLParametersMatching = [],
      importScripts = [],
      publicExcludes = [],
      buildExcludes = [],
      manifestTransforms = [],
      ...workbox
    } = pwa

    let { runtimeCaching = defaultCache } = pwa

    if (typeof nextConfig.webpack === 'function') {
      config = nextConfig.webpack(config, options)
    }

    if (disable) {
      log.info('PWA: support is disabled')
      return config
    }

    log.wait(`PWA: compile ${options.isServer ? 'server' : 'client (static)'}`)

    // inject register script to main.js
    const _sw = sw.startsWith('/') ? sw : `/${sw}`
    if (runtimeCaching[0].options.cacheName !== 'start-url') {
      throw new Error('PWA: first item in runtimeCaching array is not `start-url`')
    }
    const startUrl = runtimeCaching[0].urlPattern

    config.plugins.push(
      new webpack.DefinePlugin({
        __PWA_SW__: `'${path.posix.join(subdomainPrefix, _sw)}'`,
        __PWA_SCOPE__: `'${path.posix.join(subdomainPrefix, scope)}'`,
        __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
        __PWA_START_URL__: `'${startUrl}'`
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
        log.info(
          'PWA: build in develop mode, cache and precache are mostly disabled. \
        This means offine support is disabled, but you can continue developing other functions in service worker.'
        )
      }

      if (register) {
        log.event(`PWA: auto register service worker with: ${path.resolve(registerJs)}`)
      } else {
        log.info(
          `PWA: auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook`
        )
        log.info(`PWA:   window.workbox.register()`)
      }

      const _dest = path.join(options.dir, dest)

      log.info(`PWA: service worker: ${path.join(_dest, sw)}`)
      log.info(`PWA:   url: ${path.posix.join(subdomainPrefix, _sw)}`)
      log.info(`PWA:   scope: ${path.posix.join(subdomainPrefix, scope)}`)

      // build custom script into service worker
      let customWorkerEntry = path.join(options.dir, 'worker', 'index.js')
      const customWorkerName = `worker-${buildId}.js`
      if (fs.existsSync(customWorkerEntry)) {
        log.info(`PWA: custom worker found: ${customWorkerEntry}`)
        log.event(`PWA: build custom worker: ${path.join(_dest, customWorkerName)}`)
        webpack({
          mode: config.mode,
          target: 'webworker',
          entry: customWorkerEntry,
          output: {
            path: _dest,
            filename: customWorkerName
          },
          plugins: [
            new CleanWebpackPlugin({
              cleanOnceBeforeBuildPatterns: [path.join(_dest, 'worker-*.js'), path.join(_dest, 'worker-*.js.map')]
            })
          ]
        }).run((error, status) => {
          if (error || status.hasErrors()) {
            log.error(`PWA: failed to build custom worker: ${error}`)
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
            url: path.posix.join(subdomainPrefix, `/${f}`),
            revision: getRevision(`public/${f}`)
          }))
      }

      const prefix = config.output.publicPath ? `${config.output.publicPath}static/` : 'static/'
      const workboxCommon = {
        swDest: path.join(_dest, sw),
        additionalManifestEntries: dev ? undefined : manifestEntries,
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
          [prefix]: path.posix.join(subdomainPrefix, '/_next/static/')
        },
        manifestTransforms: [
          ...manifestTransforms,
          async (manifestEntries, compilation) => {
            const manifest = manifestEntries.map(m => {
              m.url = m.url.replace(/\/\[/g, '/%5B').replace(/\]/g, '%5D')
              return m
            })
            return { manifest, warnings: [] }
          }
        ]
      }

      if (workbox.swSrc) {
        const swSrc = path.join(options.dir, workbox.swSrc)
        log.event('PWA: inject manifest in', swSrc)
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
            runtimeCaching: dev ? undefined : runtimeCaching,
            ...workbox
          })
        )
      }
    }

    return config
  }
})
