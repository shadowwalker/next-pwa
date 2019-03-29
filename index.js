const path = require('path')
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
      disable,
      ...workbox
    } = nextConfig.pwa

    const {
      distDir = '.next'
    } = options.config

    if (!disable) {
      registerSW(config)

      config.plugins.push(new CleanPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(config.output.path, 'static/pwa', 'precache-manifest.*.js')
        ]
      }))

      if (!options.isServer) {
        const workboxCommon = {
          swDest: path.join(config.output.path, 'static/pwa', 'sw.js'),
          exclude: ['react-loadable-manifest.json', 'build-manifest.json'],
          importsDirectory: 'static/pwa',
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
  
        config.plugins.push(new ReplacePlugin([{
          dir: path.join(config.context, distDir, 'static/pwa'),
          test: /precache-manifest\..*\.js$/,
          rules: [{
            search: /static\//g,
            replace: '/_next/static/'
          },{
            search: /"revision": ".*",/g,
            replace: ''
          }]
        }, {
          dir: path.join(config.context, distDir, 'static/pwa'),
          files: ['sw.js'],
          rules: [{
            search: /static\/pwa\/precache-manifest/,
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
