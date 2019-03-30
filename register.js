import { Workbox } from 'workbox-window'

if ('serviceWorker' in navigator) {
  const wb = new Workbox("__PWA_SW__", { scope: "__PWA_SCOPE__" })

  wb.addEventListener('installed', event => {
    if (!event.isUpdate) {
      console.log('service worker installed for first time!')
    } else {
      console.log('service worker installed with an update!')
    }
  })
  
  wb.addEventListener('activated', event => {
    if (!event.isUpdate) {
      console.log('service worker activated for first time!')
    } else {
      console.log('service worker activated with an update!')
    }
  })

  wb.addEventListener('waiting', event => {
    console.log(
      'a new service worker has installed',
      'but it cannot activate until all tabs running the current version have fully unloaded'
    )
  })

  wb.register()
}