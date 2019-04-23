const path = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const ReplacePlugin = require('replace-in-file-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

const registerSW = (config) => {
  registerScript = path.join(__dirname, 'register.js')
  const entry = config.entry
  config.entry = async () => entry().then(entries => {
    if(entries['main.js'] && !entries['main.js'].includes(registerScript)) {
      entries['main.js'].unshift(registerScript)
    }
    return entries
  })
}

// For workbox configurations:
// https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      distDir = '.next'
    } = options.config

    const {
      pwa = {}
    } = options

    const {
      disable = process.env.NODE_ENV !== 'production',
      dest = distDir,
      sw = '/sw.js',
      scope = '/',
      ...workbox
    } = pwa

    if (!disable) {
      const _sw = sw.startsWith('/') ? sw : `/${sw}`
      const _dest = path.join(options.dir, dest)
      
      config.plugins.push(new webpack.DefinePlugin({
        '__PWA_SW__': `"${_sw}"`,
        '__PWA_SCOPE__': `"${scope}"`
      }))

      console.log(`> [PWA] register service worker in main.js - ${options.isServer ? '[server]' : '[static]'}`)
      registerSW(config)

      if (!options.isServer) {  
        console.log(`> [PWA] service worker url path ${_sw}`)
        console.log(`> [PWA] service worker scope ${scope}`)
        console.log(`> [PWA] generate precache manifest in ${_dest}`)
        console.log(`> [PWA] generate service worker ${path.join(_dest, sw)}`)

        config.plugins.push(new CleanPlugin({
          cleanOnceBeforeBuildPatterns: [
            path.join(_dest, 'precache-manifest.*.js'),
            path.join(_dest, sw)
          ]
        }))

        const workboxCommon = {
          swDest: path.join(_dest, sw),
          exclude: ['react-loadable-manifest.json', 'build-manifest.json'],
          importsDirectory: _dest,
          globDirectory: options.dir,
          globPatterns: [
            'static/**/*'
          ],
          modifyURLPrefix: {
            'static': '/static'
          }
        }

        if (workbox.swSrc) {
          const swSrc = path.join(options.dir, workbox.swSrc)
          console.log('> [PWA] Injecting manifest in', swSrc)
          config.plugins.push(
            new WorkboxPlugin.InjectManifest({
              ...workboxCommon,
              ...workbox,
              swSrc,
            })
          )
        } else {
          console.log('> [PWA] generating new service worker', path.join(_dest, sw))
          config.plugins.push(
            new WorkboxPlugin.GenerateSW({
              ...workboxCommon,
              skipWaiting: true,
              clientsClaim: true,
              cleanupOutdatedCaches: true,
              runtimeCaching: [{
                urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts',
                  expiration: {
                    maxEntries: 16,
                    maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
                  }
                }
              }, {
                urlPattern: /^https:\/\/use\.fontawesome\.com\/releases\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'font-awesome',
                  expiration: {
                    maxEntries: 16,
                    maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
                  }
                }
              }, {
                urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'static-font-assets',
                  expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 7 * 24 * 60 * 60  // 7 days
                  }
                }
              }, {
                urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'static-image-assets',
                  expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 7 * 24 * 60 * 60  // 7 days
                  }
                }
              }, {
                urlPattern: /.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'pages',
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }],
              ...workbox
            })
          )
        }
  
        config.plugins.push(new ReplacePlugin([{
          dir: _dest,
          test: /precache-manifest\..*\.js$/,
          rules: [{
            search: /"static\//g,
            replace: '"/_next/static/'
          },{
            search: /concat\(\[/g,
            replace: 'concat([ { "url": "/" },'
          }]
        }, {
          dir: _dest,
          files: [path.basename(sw)],
          rules: [{
            search: path.join(path.relative(config.output.path, _dest), 'precache-manifest'),
            replace: 'precache-manifest'
          }]
        }]))
      }
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options)
    }

    return config
  }
})
