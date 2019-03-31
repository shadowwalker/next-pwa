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

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {
      distDir = '.next'
    } = options.config

    const {
      disable = process.env.NODE_ENV !== 'production',
      dest = distDir,
      sw = '/sw.js',
      scope = '/',
      ...workbox
    } = nextConfig.pwa

    if (!disable) {
      config.plugins.push(new webpack.DefinePlugin({
        '__PWA_SW__': sw,
        '__PWA_SCOPE__': scope
      }))

      console.log(`> [PWA] register service worker in main.js for ${options.isServer ? 'server' : 'static'}`)
      registerSW(config)

      if (!options.isServer) {
        const _sw = sw.startsWith('/') ? sw : `/${sw}`
        const _dest = path.join(options.dir, dest)

        console.log(`> [PWA] service worker url path ${_sw}`)
        console.log(`> [PWA] service worker scope ${scope}`)
        console.log(`> [PWA] generate precache manifest at ${_dest}`)
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
