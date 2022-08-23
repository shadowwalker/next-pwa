const withPWA = require('next-pwa')

module.exports = withPWA({
  images: {
    domains: ['source.unsplash.com']
  },
  pwa: {
    dest: 'public',
    swSrc: 'service-worker.js'
  }
})
