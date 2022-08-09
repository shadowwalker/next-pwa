const withPWA = require('next-pwa')

const nextConfig = {};

module.exports = withPWA(nextConfig, {
  dest: 'public',
  swSrc: 'service-worker.js'
})
