const withPWA = require('@brainwires/next-pwa')({
  dest: 'public',
  fallbacks: {
    image: '/static/images/fallback.png'
    // document: '/other-offline',  // if you want to fallback to a custom page other than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  }
})

module.exports = withPWA({
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'source.unsplash.com' }]
  }
})
