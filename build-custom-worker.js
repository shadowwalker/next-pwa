'use strict'

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const buildCustomWorker = ({ id, basedir, customWorkerDir, destdir, plugins, minify }) => {
  let workerDir = undefined

  if (fs.existsSync(path.join(basedir, customWorkerDir))) {
    workerDir = path.join(basedir, customWorkerDir)
  } else if (fs.existsSync(path.join(basedir, 'src', customWorkerDir))) {
    workerDir = path.join(basedir, 'src', customWorkerDir)
  }

  if (!workerDir) return

  const name = `worker-${id}.js`
  const customWorkerEntries = ['ts', 'js']
    .map(ext => path.join(workerDir, `index.${ext}`))
    .filter(entry => fs.existsSync(entry))

  if (customWorkerEntries.length === 0) return

  if (customWorkerEntries.length > 1) {
    console.warn(
      `> [PWA] WARNING: More than one custom worker found (${customWorkerEntries.join(
        ','
      )}), not building a custom worker`
    )
    return
  }

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
      extensions: ['.ts', '.js'],
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        path: false,
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        http2: false,
        net: false,
        tls: false,
        zlib: false,
        child_process: false
      }
    },
    module: {
      rules: [
        {
          test: /\.(t|j)s$/i,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    'next/babel',
                    {
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
                    }
                  ]
                ]
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
    optimization: minify
      ? {
          minimize: true,
          minimizer: [new TerserPlugin()]
        }
      : undefined
  }).run((error, status) => {
    if (error || status.hasErrors()) {
      console.error(`> [PWA] Failed to build custom worker`)
      console.error(status.toString({ colors: true }))
      process.exit(-1)
    }
  })

  return name
}

module.exports = buildCustomWorker
