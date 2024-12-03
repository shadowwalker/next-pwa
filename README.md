# Zero Config [PWA](https://web.dev/learn/pwa/) Plugin for [Next.js](https://nextjs.org/)

pwa library for creating webapps in  [Next.js](https://nextjs.org/) . Powered by [workbox](https://developer.chrome.com/docs/workbox/).


**Features**

- Zero config for registering and generating service worker
- Optimized precache and runtime cache
- Maximize lighthouse score
- Easy to understand examples
- Completely offline support with fallbacks  
- Use [workbox](https://developer.chrome.com/docs/workbox/) and [workbox-window](https://developer.chrome.com/docs/workbox/modules/workbox-window) v7
- Work with cookies out of the box
- Default range requests for audios and videos
- No custom server needed for Next.js 13+
- Handle PWA lifecycle events opt-in 
- Custom worker to run extra code with code splitting and **typescript** support 
- [Public environment variables](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser) available in custom worker as usual
- Debug service worker with confidence in development mode without caching
- 🛠 Configurable by the same [workbox configuration options](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#generatesw-plugin) and [InjectManifest](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#injectmanifest-plugin)

> **NOTE 1** - `imuigai-next-pwa` version 0.0.1+ should only work with `next.js` 13.0.0+, and static files should only be served through `public` directory. This will make things simpler.
>
> **NOTE 2** - If you encounter error `TypeError: Cannot read property **'javascript' of undefined**` during build, [please consider upgrade to webpack5 in `next.config.js`](https://github.com/Red-misst/imuigai-next-pwa/issues/198#issuecomment-817205700).

---


## Install

> If you are new to `next.js` or `react.js` at all, you may want to first checkout [learn next.js](https://nextjs.org/learn/basics/create-nextjs-app) or [next.js document](https://nextjs.org/docs/getting-started). Then start from [a simple example](https://github.com/Red-misst/imuigai-next-pwa/tree/master/examples/next-9) or [progressive-web-app example in next.js repository](https://github.com/vercel/next.js/tree/canary/examples/progressive-web-app).

```bash
yarn add imuigai-next-pwa
or 
npm i imuigai-next-pwa
```

## Basic Usage

### Step 1: withPWA

Update or create `next.config.js` with

```javascript
const withPWA = require('imuigai-next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  // next.js config
})
```

After running `next build`, this will generate two files in your `public`: `workbox-*.js` and `sw.js`, which will automatically be served statically.

If you are using Next.js version 9 or newer, then skip the options below and move on to Step 2.

If you are using Next.js older than version 9, you'll need to pick an option below before continuing to Step 2.

### Option 1: Host Static Files

Copy files to your static file hosting server, so that they are accessible from the following paths: `https://yourdomain.com/sw.js` and `https://yourdomain.com/workbox-*.js`.

One example is using Firebase hosting service to host those files statically. You can automate the copy step using scripts in your deployment workflow.

> For security reasons, you must host these files directly from your domain. If the content is delivered using a redirect, the browser will refuse to run the service worker.

### Option 2: Use Custom Server

When an HTTP request is received, test if those files are requested, then return those static files.

Example `server.js`

```javascript
const { createServer } = require('http')
const { join } = require('path')
const { parse } = require('url')
const next = require('next')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    if (pathname === '/sw.js' || /^\/(workbox|worker|fallback)-\w+\.js$/.test(pathname)) {
      const filePath = join(__dirname, '.next', pathname)
      app.serveStatic(req, res, filePath)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3000, () => {
    console.log(`> Ready on http://localhost:${3000}`)
  })
})
```

> The following setup has nothing to do with `imuigai-next-pwa` plugin, and you probably have already set them up. If not, go ahead and set them up.

### Step 2: Add Manifest File (Example)

Create a `manifest.json` file in your `public` folder:

```json
{
  "name": "PWA App",
  "short_name": "App",
  "icons": [
    {
      "src": "/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/android-chrome-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Step 3: Add Head Meta (Example)

Add the following into `_document.jsx` or `_app.tsx`, in `<Head>`:

```html
<meta name="application-name" content="PWA App" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="PWA App" />
<meta name="description" content="Best PWA App in the world" />
<meta name="format-detection" content="telephone=no" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="msapplication-config" content="/icons/browserconfig.xml" />
<meta name="msapplication-TileColor" content="#2B5797" />
<meta name="msapplication-tap-highlight" content="no" />
<meta name="theme-color" content="#000000" />

<link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
<link rel="manifest" href="/manifest.json" />
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />

<meta name="twitter:card" content="summary" />
<meta name="twitter:url" content="https://yourdomain.com" />
<meta name="twitter:title" content="PWA App" />
<meta name="twitter:description" content="Best PWA App in the world" />
<meta name="twitter:image" content="https://yourdomain.com/icons/android-chrome-192x192.png" />
<meta name="twitter:creator" content="@DavidWShadow" />
<meta property="og:type" content="website" />
<meta property="og:title" content="PWA App" />
<meta property="og:description" content="Best PWA App in the world" />
<meta property="og:site_name" content="PWA App" />
<meta property="og:url" content="https://yourdomain.com" />
<meta property="og:image" content="https://yourdomain.com/icons/apple-touch-icon.png" />

<!-- apple splash screen images -->
<!--
<link rel='apple-touch-startup-image' href='/images/apple_splash_2048.png' sizes='2048x2732' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_1668.png' sizes='1668x2224' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_1536.png' sizes='1536x2048' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_1125.png' sizes='1125x2436' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_1242.png' sizes='1242x2208' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_750.png' sizes='750x1334' />
<link rel='apple-touch-startup-image' href='/images/apple_splash_640.png' sizes='640x1136' />
-->
```

> Tip: Put the `viewport` head meta tag into `_app.js` rather than in `_document.js` if you need it.

```typescript
<meta
  name='viewport'
  content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
/>
```

## Offline Fallbacks

Offline fallbacks are useful when the fetch failed from both cache and network, a precached resource is served instead of present an error from browser.

To get started simply add a `/_offline` page such as `pages/_offline.js` or `pages/_offline.jsx` or `pages/_offline.ts` or `pages/_offline.tsx`. Then you are all set! When the user is offline, all pages which are not cached will fallback to '/\_offline'.

**[Use this example to see it in action](https://github.com/Red-misst/imuigai-next-pwa/tree/master/examples/offline-fallback-v2)**

`imuigai-next-pwa` helps you precache those resources on the first load, then inject a fallback handler to `handlerDidError` plugin to all `runtimeCaching` configs, so that precached resources are served when fetch failed.

You can also setup `precacheFallback.fallbackURL` in your [runtimeCaching config entry](https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-RuntimeCaching) to implement similar functionality. The difference is that above method is based on the resource type, this method is based matched url pattern. If this config is set in the runtimeCaching config entry, resource type based fallback will be disabled automatically for this particular url pattern to avoid conflict.

## Configuration

There are options you can use to customize the behavior of this plugin by adding `pwa` object in the next config in `next.config.js`:

```javascript
const withPWA = require('imuigai-next-pwa')({
  dest: 'public'
  // disable: process.env.NODE_ENV === 'development',
  // register: true,
  // scope: '/app',
  // sw: 'service-worker.js',
  //...
})

module.exports = withPWA({
  // next.js config
})
```

### Other Options

`imuigai-next-pwa` uses `workbox-webpack-plugin`, other options which could also be put in `pwa` object can be found [**ON THE DOCUMENTATION**](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#generatesw-plugin) and [InjectManifest](https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#injectmanifest-plugin). If you specify `swSrc`, `InjectManifest` plugin will be used, otherwise `GenerateSW` will be used to generate service worker.

### Runtime Caching

`imuigai-next-pwa` uses a default runtime [cache.js](https://github.com/Red-misst/imuigai-next-pwa/blob/master/cache.js)

There is a great chance you may want to customize your own runtime caching rules. Please feel free to copy the default `cache.js` file and customize the rules as you like. Don't forget to inject the configurations into your `pwa` config in `next.config.js`.

Here is the [document on how to write runtime caching configurations](https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-RuntimeCaching), including background sync and broadcast update features and more!

## Tips

1. [Common UX pattern to ask user to reload when new service worker is installed](https://github.com/Red-misst/imuigai-next-pwa/blob/master/examples/lifecycle/pages/index.js#L26-L38)
2. Use a convention like `{command: 'doSomething', message: ''}` object when `postMessage` to service worker. So that on the listener, it could do multiple different tasks using `if...else...`.
3. When you are debugging service worker, constantly `clean application cache` to reduce some flaky errors.
4. If you are redirecting the user to another route, please note [workbox by default only cache response with 200 HTTP status](https://developer.chrome.com/docs/workbox/modules/workbox-cacheable-response#what_are_the_defaults), if you really want to cache redirected page for the route, you can specify it in `runtimeCaching` such as `options.cacheableResponse.statuses=[200,302]`.
5. When debugging issues, you may want to format your generated `sw.js` file to figure out what's really going on.
6. Force `imuigai-next-pwa` to generate worker box production build by specify the option `mode: 'production'` in your `pwa` section of `next.config.js`. Though `imuigai-next-pwa` automatically generate the worker box development build during development (by running `next`) and worker box production build during production (by running `next build` and `next start`). You may still want to force it to production build even during development of your web app for following reason:
   1. Reduce logging noise due to production build doesn't include logging.
   2. Improve performance a bit due to production build is optimized and minified.
7. If you just want to disable worker box logging while keeping development build during development, [simply put `self.__WB_DISABLE_DEV_LOGS = true` in your `worker/index.js` (create one if you don't have one)](https://github.com/Red-misst/imuigai-next-pwa/blob/c48ef110360d0138ad2dacd82ab96964e3da2daf/examples/custom-worker/worker/index.js#L6).
8. It is common developers have to use `userAgent` string to determine if users are using Safari/iOS/MacOS or some other platform, [ua-parser-js](https://www.npmjs.com/package/ua-parser-js) library is a good friend for that purpose.

## Reference

1. [Google Workbox](https://developer.chrome.com/docs/workbox/what-is-workbox/)
2. [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage) by [Nicolás Bevacqua](https://ponyfoo.com/contributors/ponyfoo)
3. [The Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
4. [6 Tips to make your iOS PWA feel like a native app](https://www.netguru.com/codestories/pwa-ios)
5. [Make Your PWA Available on Google Play Store](https://www.netguru.com/codestories/make-your-pwa-available-on-google-play-store)

## License

MIT
