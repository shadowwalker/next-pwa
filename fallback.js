'use strict'

self.fallback = async request => {
  // https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
  switch (request.destination) {
    case 'document':
      if (process.env.__PWA_FALLBACK_DOCUMENT__)
        return caches.match(process.env.__PWA_FALLBACK_DOCUMENT__, { ignoreSearch: true })
    case 'image':
      if (process.env.__PWA_FALLBACK_IMAGE__)
        return caches.match(process.env.__PWA_FALLBACK_IMAGE__, { ignoreSearch: true })
    case 'audio':
      if (process.env.__PWA_FALLBACK_AUDIO__)
        return caches.match(process.env.__PWA_FALLBACK_AUDIO__, { ignoreSearch: true })
    case 'video':
      if (process.env.__PWA_FALLBACK_VIDEO__)
        return caches.match(process.env.__PWA_FALLBACK_VIDEO__, { ignoreSearch: true })
    case 'font':
      if (process.env.__PWA_FALLBACK_FONT__)
        return caches.match(process.env.__PWA_FALLBACK_FONT__, { ignoreSearch: true })
    case '':
      if (process.env.__PWA_FALLBACK_DATA__ && request.url.match(/\/_next\/data\/.+\/.+\.json$/i))
        return caches.match(process.env.__PWA_FALLBACK_DATA__, { ignoreSearch: true })
    default:
      return Response.error()
  }
}
