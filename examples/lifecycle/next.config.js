const withPWA = require('@brainwires/next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: false
})

module.exports = withPWA()
