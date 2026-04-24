const { i18n } = require('./next-i18next.config')

const withPWA = require('@brainwires/next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  i18n
})
