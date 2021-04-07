import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const initWorkbox = function() {
    window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })

    if(__PWA_ENABLE_REGISTER__) {
      window.workbox.register()
    }
  }

  if(__PWA_START_URL__) {
    fetch(__PWA_START_URL__).then(function(response) {
      if (!response.ok && !response.redirected) return
      return caches.open('start-url').then(function(cache) {
        return cache.put(__PWA_START_URL__, response).then(initWorkbox)
      })
    })
  } else {
    initWorkbox()
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
