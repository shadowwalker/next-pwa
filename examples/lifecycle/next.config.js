const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: false
})

module.exports = withPWA()
