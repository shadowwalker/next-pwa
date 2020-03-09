const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    // pwa output folder
    // dest: '.next/pwa'
    // 
    // Other configurations:
    // ...
  },
  publicRuntimeConfig: {
    localeSubpaths: typeof process.env.LOCALE_SUBPATHS === 'string'
      ? process.env.LOCALE_SUBPATHS
      : 'none'
  }
})
