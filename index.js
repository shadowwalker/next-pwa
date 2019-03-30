const path = require('path')
const webpack = require('webpack')
const _ = require('lodash')
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
        '__PWA_SCOPE__': scope,
        '__PWA_SW__': sw
      }))

      registerSW(config)

      config.plugins.push(new CleanPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(options.dir, dest, 'precache-manifest.*.js')
        ]
      }))

      if (!options.isServer) {
        const workboxCommon = {
          swDest: path.join(options.dir, dest, sw),
          exclude: ['react-loadable-manifest.json', 'build-manifest.json'],
          importsDirectory: path.join(options.dir, dest),
          globDirectory: options.dir,
          globPatterns: [
            'static/**/*'
          ],
          modifyURLPrefix: {
            'static': '/static'
          }
        }

        if (workbox.swSrc) {
          config.plugins.push(
            new WorkboxPlugin.InjectManifest({
              ...workboxCommon,
              ...workbox
            })
          )
        } else {
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

        console.log(path.join(options.dir, dest, sw))
        console.log(path.join(path.relative(config.output.path, path.join(options.dir, dest)), 'precache-manifest'))
  
        config.plugins.push(new ReplacePlugin([{
          dir: path.join(options.dir, dest),
          test: /precache-manifest\..*\.js$/,
          rules: [{
            search: /"static\//g,
            replace: '"/_next/static/'
          }]
        }, {
          dir: path.join(options.dir, dest),
          files: [path.basename(sw)],
          rules: [{
            search: path.join(path.relative(config.output.path, path.join(options.dir, dest)), 'precache-manifest'),
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
