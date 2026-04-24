'use strict'

self.fallback = async request => {
  // https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
  const { destination, url } = request
  if (destination === 'document' && process.env.__PWA_FALLBACK_DOCUMENT__) {
    return caches.match(process.env.__PWA_FALLBACK_DOCUMENT__, { ignoreSearch: true })
  }
  if (destination === 'image' && process.env.__PWA_FALLBACK_IMAGE__) {
    return caches.match(process.env.__PWA_FALLBACK_IMAGE__, { ignoreSearch: true })
  }
  if (destination === 'audio' && process.env.__PWA_FALLBACK_AUDIO__) {
    return caches.match(process.env.__PWA_FALLBACK_AUDIO__, { ignoreSearch: true })
  }
  if (destination === 'video' && process.env.__PWA_FALLBACK_VIDEO__) {
    return caches.match(process.env.__PWA_FALLBACK_VIDEO__, { ignoreSearch: true })
  }
  if (destination === 'font' && process.env.__PWA_FALLBACK_FONT__) {
    return caches.match(process.env.__PWA_FALLBACK_FONT__, { ignoreSearch: true })
  }
  if (destination === '' && process.env.__PWA_FALLBACK_DATA__ && url.match(/\/_next\/data\/.+\/.+\.json$/i)) {
    return caches.match(process.env.__PWA_FALLBACK_DATA__, { ignoreSearch: true })
  }
  return Response.error()
}
