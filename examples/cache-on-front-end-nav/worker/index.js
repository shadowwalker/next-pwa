'use strict'

self.addEventListener('message', async event => {
  if (event.data && event.data.action === 'CACHE_NEW_ROUTE') {
    caches.open('others').then(cache =>
      cache.match(event.source.url).then(res => {
        if (res === undefined) {
          return cache.add(event.source.url)
        }
      })
    )
  }
})
