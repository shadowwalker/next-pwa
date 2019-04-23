import { Workbox } from 'workbox-window'

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const wb = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })

  wb.addEventListener('installed', event => {
    if (!event.isUpdate) {
      console.log('[PWA] service worker installed for first time!')
    } else {
      console.log('[PWA] service worker installed with an update!')
    }
  })
  
  wb.addEventListener('activated', event => {
    if (!event.isUpdate) {
      console.log('[PWA] service worker activated for first time!')
    } else {
      console.log('[PWA] service worker activated with an update!')
    }
  })

  // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  /*
  wb.addEventListener('waiting', event => {
    console.log(
      '[PWA] a new service worker has installed',
      '[PWA] but it cannot activate until all tabs running the current version have fully unloaded'
    )
    // `event.wasWaitingBeforeRegister` will be false if this is
    // the first time the updated service worker is waiting.
    // When `event.wasWaitingBeforeRegister` is true, a previously
    // updated same service worker is still waiting.
    // You may want to customize the UI prompt accordingly.

    // Assumes your app has some sort of prompt UI element
    // that a user can either accept or reject.
    const prompt = createUIPrompt({
      onAccept: async () => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', (event) => {
          window.location.reload();
        });

        // Send a message telling the service worker to skip waiting.
        // This will trigger the `controlling` event handler above.
        // Note: for this to work, you have to add a message
        // listener in your service worker. See below.
        wb.messageSW({type: 'SKIP_WAITING'});
      },

      onReject: () => {
        prompt.dismiss();
      }
    })
  })
  */

  wb.register()
}