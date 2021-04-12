const withPWA = require('next-pwa')

// change start-url cache strategy, so that we can prompt user to reload when
// new version available, instead of showing new version directly
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: false,
    skipWaiting: false,
    runtimeCaching
  }
})
