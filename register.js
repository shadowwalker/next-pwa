import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const initWorkbox = function(e) {
    window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })

    if(__PWA_ENABLE_REGISTER__) {
      window.workbox.register()
    }
  }

  if(__PWA_START_URL__) {
    caches.open('start-url').then(function(cache) {
      cache.add(__PWA_START_URL__).then(initWorkbox)
    })
  } else {
    initWorkbox()
  }
}
