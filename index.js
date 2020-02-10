const path = require('path')
const webpack = require('webpack')
const globby = require('globby')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

const defaultCache = [{
  urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts',
    expiration: {
      maxEntries: 4,
      maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
    }
  }
}, {
  urlPattern: /^https:\/\/use\.fontawesome\.com\/releases\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'font-awesome',
    expiration: {
      maxEntries: 1,
      maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
    }
  }
}, {
  urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-font-assets',
    expiration: {
      maxEntries: 4,
      maxAgeSeconds: 7 * 24 * 60 * 60  // 7 days
    }
  }
}, {
  urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-image-assets',
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /\.(?:js)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-js-assets',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /\.(?:css|less)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-style-assets',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'others',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}]

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const buildId = options.buildId

    const {
      distDir = '.next',
      pwa = {}
    } = options.config

    let publicPrecaches = globby.sync(['**/*', '!workbox-*.js'], {
      cwd: 'public'
    }).map(f => ({
      url: `/${f}`,
      revision: buildId
    }))
    publicPrecaches = [...publicPrecaches, {url: '/', revision: buildId}]

    // For workbox configurations:
    // https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
    const {
      disable = options.dev,
      register = true,
      dest = distDir,
      sw = '/sw.js',
      scope = '/',
      runtimeCaching = defaultCache,
      additionalManifestEntries = publicPrecaches,
      ...workbox
    } = pwa

    const registerJs = path.join(__dirname, 'register.js')

    if (!disable) {
      console.log(`> [PWA] compile ${options.isServer ? 'server' : 'client (static)'}`)

      const _sw = sw.startsWith('/') ? sw : `/${sw}`
      const _dest = path.join(options.dir, dest)
      
      // replace strings in register js script
      config.plugins.push(new webpack.DefinePlugin({
        '__PWA_SW__': `"${_sw}"`,
        '__PWA_SCOPE__': `"${scope}"`,
        '__PWA_ENABLE_REGISTER__': `${Boolean(register)}`
      }))
      
      // register script is prepended to main entry in both server and client side for consistency,
      // it won't run any actual code on server side though
      const entry = config.entry
      config.entry = async () => entry().then(entries => {
        if(entries['main.js'] && !entries['main.js'].includes(registerJs)) {
          entries['main.js'].unshift(registerJs)
        }
        return entries
      })

      if (!options.isServer) {
        if(register){
          console.log(`> [PWA] auto register service worker with: ${path.resolve(registerJs)}`)
        } else {
          console.log(`> [PWA] auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook`)
          console.log(`> [PWA]   window.workbox.register()`)
        }

        console.log(`> [PWA] service worker: ${path.join(_dest, sw)}`)
        console.log(`> [PWA]   url: ${_sw}`)
        console.log(`> [PWA]   scope: ${scope}`)

        config.plugins.push(new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            path.join(_dest, 'workbox-*.js'),
            path.join(_dest, sw)
          ]
        }))

        const workboxCommon = {
          swDest: path.join(_dest, sw),
          additionalManifestEntries,
          exclude: [
            'react-loadable-manifest.json', 
            'build-manifest.json'
          ],
          modifyURLPrefix: {
            'static/': '/_next/static/'
          }
        }

        if (workbox.swSrc) {
          const swSrc = path.join(options.dir, workbox.swSrc)
          console.log('> [PWA] inject manifest in', swSrc)
          config.plugins.push(
            new WorkboxPlugin.InjectManifest({
              ...workboxCommon,
              ...workbox,
              swSrc
            })
          )
        } else {
          if (typeof runtimeCaching === 'function') {
            runtimeCaching = runtimeCaching(defaultCache)
          }

          config.plugins.push(
            new WorkboxPlugin.GenerateSW({
              ...workboxCommon,
              skipWaiting: true,
              clientsClaim: true,
              cleanupOutdatedCaches: true,
              runtimeCaching,
              ...workbox
            })
          )
        }
      }
    } else {
      console.log('> [PWA] PWA support is disabled')
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options)
    }

    return config
  }
})
