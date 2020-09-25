import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })
  
  window.workbox.addEventListener('activated', function(event) {
    if (!event.isUpdate) {
      caches.keys().then(function(c) {
        if (!c.includes('start-url')) {
          fetch(__PWA_START_URL__)
        }
      });
    }
  })

  if(__PWA_ENABLE_REGISTER__) {
    window.workbox.register()
  }
}
