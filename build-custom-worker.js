'use strict'

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const buildCustomWorker = ({ name, basedir, destdir, plugins, success, minify }) => {
  const customWorkerEntries = ['ts', 'js']
    .map(ext => path.join(basedir, 'worker', `index.${ext}`))
    .filter(entry => fs.existsSync(entry))

  if (customWorkerEntries.length === 1) {
    const customWorkerEntry = customWorkerEntries[0]
    console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`)
    console.log(`> [PWA] Build custom worker: ${path.join(destdir, name)}`)
    webpack({
      mode: 'none',
      target: 'webworker',
      entry: {
        main: customWorkerEntry
      },
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.(t|j)s$/i,
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
                  }]]
                }
              }
            ]
          }
        ]
      },
      output: {
        path: destdir,
        filename: name
      },
      plugins: [
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [path.join(destdir, 'worker-*.js'), path.join(destdir, 'worker-*.js.map')]
        })
      ].concat(plugins),
      optimization: minify ? {
        minimize: true,
        minimizer: [new TerserPlugin()]
      } : undefined
    }).run((error, status) => {
      if (error || status.hasErrors()) {
        console.error(`> [PWA] Failed to build custom worker`)
        console.error(status.toString({ colors: true }))
        process.exit(-1)
      } else {
        success()
      }
    })
  }
}

module.exports = buildCustomWorker
