import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })
  
  window.workbox.addEventListener('activated', async event => {
    if (!event.isUpdate) {
      const c = await caches.keys()
      if (!c.includes('start-url')) {
        fetch(__PWA_START_URL__)
      }
    }
  })

  if(__PWA_ENABLE_REGISTER__) {
    window.workbox.register()
  }
}
