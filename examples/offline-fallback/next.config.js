const withPWA = require('next-pwa')({
  dest: 'public',
  swSrc: 'service-worker.js'
})

module.exports = withPWA({
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'source.unsplash.com' }]
  }
})
