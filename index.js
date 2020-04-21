'use strict'

const path = require('path')
const fs = require('fs-extra')
const globby = require('globby')
const crypto = require('crypto')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const defaultCache = require('./cache')

const getRevision = file => crypto.createHash('md5').update(Buffer.from(file)).digest('hex')

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      webpack,
      buildId,
      dev,
      config: { distDir = '.next', pwa = {} }
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
      ...workbox
    } = pwa

    let { runtimeCaching = defaultCache } = pwa

    if (typeof nextConfig.webpack === 'function') {
      config = nextConfig.webpack(config, options)
    }

    if (disable) {
      console.log('> [PWA] PWA support is disabled')
      return config
    }

    console.log(`> [PWA] Compile ${options.isServer ? 'server' : 'client (static)'}`)

    // inject register script to main.js
    const _sw = sw.startsWith('/') ? sw : `/${sw}`
    
    config.plugins.push(
      new webpack.DefinePlugin({
        __PWA_SW__: `"${path.join(subdomainPrefix, _sw)}"`,
        __PWA_SCOPE__: `"${path.join(subdomainPrefix, scope)}"`,
        __PWA_ENABLE_REGISTER__: `${Boolean(register)}`
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
        console.log('> [PWA] Build in develop mode, cache and precache are mostly disabled. \
        This means offine support is disabled, but you can continue developing other functions in service worker.')
      }

      if (register) {
        console.log(`> [PWA] Auto register service worker with: ${path.resolve(registerJs)}`)
      } else {
        console.log(`> [PWA] Auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook`)
        console.log(`> [PWA]   window.workbox.register()`)
      }

      const _dest = path.join(options.dir, dest)

      console.log(`> [PWA] Service worker: ${path.join(_dest, sw)}`)
      console.log(`> [PWA]   url: ${path.join(subdomainPrefix, _sw)}`)
      console.log(`> [PWA]   scope: ${path.join(subdomainPrefix, scope)}`)

      // build custom worker
      let customWorkerEntry = path.join(options.dir, 'worker', 'index.js')
      const customWorkerName = `worker-${buildId}.js`
      if (fs.existsSync(customWorkerEntry)) {
        console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`)
        console.log(`> [PWA] Build custom worker: ${path.join(_dest, customWorkerName)}`)
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
              cleanOnceBeforeBuildPatterns: [
                path.join(_dest, 'worker-*.js'),
                path.join(_dest, 'worker-*.js.map')
              ]
            })
          ]
        }).run((error, status) => {
          if (error || status.hasErrors()) {
            console.error(`> [PWA] Failed to build custom worker: ${error}`)
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
          .sync(['**/*', '!workbox-*.js', '!workbox-*.js.map', '!worker-*.js', '!worker-*.js.map',
            `!${sw.replace(/^\/+/, '')}`, `!${sw.replace(/^\/+/, '')}.map`].concat(publicExcludes), {
            cwd: 'public'
          })
          .map(f => ({
            url: path.join(subdomainPrefix,`/${f}`),
            revision: getRevision(`public/${f}`)
          }))
        manifestEntries.push({ url: path.join(subdomainPrefix, '/'), revision: buildId })
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
            return false
          }
        ],
        modifyURLPrefix: {
          [prefix]: path.join(subdomainPrefix, '/_next/static/')
        }
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
            runtimeCaching: dev ? undefined : runtimeCaching,
            ...workbox
          })
        )
      }
    }

    return config
  }
})
