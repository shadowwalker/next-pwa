import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  caches.has('start-url').then(function(has) {
    if (!has) {
      caches.open('start-url').then(c => c.put(__PWA_START_URL__, new Response('', {status: 200})))
    }
  })

  window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })

  if (__PWA_START_URL__) {
    window.workbox.addEventListener('installed', async ({isUpdate}) => {
      if (!isUpdate) {
        const cache = await caches.open('start-url')
        const response = await fetch(__PWA_START_URL__)
        let _response = response
        if (response.redirected) {
          _response = new Response(response.body, {status: 200, statusText: 'OK', headers: response.headers})
        }

        await cache.put(__PWA_START_URL__, _response)
      }
    })
  }

  if(__PWA_ENABLE_REGISTER__) {
    window.workbox.register()
  }

  if(__PWA_CACHE_ON_FRONT_END_NAV__) {
    const cacheOnFrontEndNav = function(url) {
      if (!window.navigator.onLine) return
      if (__PWA_START_URL__ && url === __PWA_START_URL__) return
      caches.open('others').then(cache =>
        cache.match(url, {ignoreSearch: true}).then(res => {
          if (!res) return cache.add(url)
        })
      )
    }

    const pushState = history.pushState
    history.pushState = function () {
      pushState.apply(history, arguments)
      cacheOnFrontEndNav(arguments[0].url)
    }

    const replaceState = history.replaceState
    history.replaceState = function () {
      replaceState.apply(history, arguments)
      cacheOnFrontEndNav(arguments[0].url)
    }

    window.addEventListener('online', () => {
      cacheOnFrontEndNav(window.location.pathname)
    })
  }
}
