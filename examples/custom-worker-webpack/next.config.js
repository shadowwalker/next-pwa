const withPWA = require('next-pwa')({
  dest: 'public',
  customWorkerWebpack(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@util': path.resolve(__dirname, './src'),
        }
      }
    };
  }
})

module.exports = withPWA()
