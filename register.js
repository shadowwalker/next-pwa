import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })
  if(__PWA_ENABLE_REGISTER__) {
    window.workbox.addEventListener('activated', event => {
      if (!event.isUpdate) {
        fetch(__PWA_START_URL__)
      }
    })
    window.workbox.register()
  }
}
