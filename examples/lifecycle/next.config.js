const withPWA = require('next-pwa')

const nextConfig = {};

module.exports = withPWA(nextConfig, {
  dest: 'public',
  register: false,
  skipWaiting: false
})
