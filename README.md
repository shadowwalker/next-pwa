# Zero Config [PWA](https://developers.google.com/web/progressive-web-apps/) Plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [workbox](https://developers.google.com/web/tools/workbox/) and other good stuff.

![size](https://img.shields.io/bundlephobia/minzip/next-pwa.svg) ![dependencies](https://img.shields.io/librariesio/release/npm/next-pwa) ![downloads](https://img.shields.io/npm/dw/next-pwa.svg) ![license](https://img.shields.io/npm/l/next-pwa.svg)

**Features**

- 0️⃣ Zero config for registering and generating a service worker
- ✨ Optimized precache and runtime cache
- 💯 Maximize lighthouse score
- 🎈 Easy to understand examples
- 📴 Completely offline support
- 📦 Use workbox and workbox-window v6
- 🍪 Work with cookies out of the box 
- ☕ No custom server needed for Next.js 9+ [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-9)
- 🔧 Handle PWA lifecycle events opt-in [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/lifecycle)
- 📐 Custom worker to run extra code with code splitting and **typescript** support [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/custom-ts-worker)
- 📜 Environment variable exposed to custom worker
- 🐞 Debug service worker with confidence in development mode without caching
- 🌏 Internationalization (a.k.a I18N) with `next-i18next` [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-i18next)
- 🛠 Configurable by the same [workbox configuration options](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW) and [InjectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest)
- 🚀 Spin up a [GitPod](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/) and try out examples in rocket speed
- 🔩 (Experimental) precaching `.module.js` when `next.config.js` has `experimental.modern` set to `true`

> **NOTE** - `next-pwa` version 2.0.0+ should only work with `next.js` 9.1+, and static files should only be served through `public` directory. This will make things simpler.

----

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

## Install

> If you are new to `next.js` or `react.js` at all, you may want to first checkout [learn next.js](https://nextjs.org/learn/basics/create-nextjs-app) or [next.js document](https://nextjs.org/docs/getting-started). Then start from [a simple example](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-9) or [progressive-web-app example in next.js repository](https://github.com/vercel/next.js/tree/canary/examples/progressive-web-app).

``` bash
yarn add next-pwa
```

## Basic Usage

### Step 1: withPWA

Update or create `next.config.js` with

``` javascript
const withPWA = require('next-pwa')

module.exports = withPWA({
  // other next config
})
```

After running `next build`, this will generate two files in your `distDir` (default is `.next` folder): `workbox-*.js` and `sw.js`, which you need to serve statically, either through static file hosting service or using custom `server.js`.

> If you are using Next.js 9+, you may not need a custom server to host your service worker files. Skip to next section to see the details.

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

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl
      
      if (pathname === '/sw.js' || pathname.startsWith('/workbox-')) {
        const filePath = join(__dirname, '.next', pathname)
        app.serveStatic(req, res, filePath)
      } else {
        handle(req, res, parsedUrl)
      }
    })
    .listen(3000, () => {
      console.log(`> Ready on http://localhost:${3000}`)
    })
  })
```

> The following setup has nothing to do with `next-pwa` plugin, and you probably have already set them up. If not, go ahead and set them up.

### Step 2: Add Manifest File (Example)

Create a `manifest.json` file in your `static` folder:

```json
{
  "name": "PWA App",
  "short_name": "App",
  "icons": [
    {
      "src": "/static/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/static/icons/android-chrome-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/static/icons/icon-512x512.png",
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

Add the following into `_document.jsx` or `_document.tsx`, in `<Head>`:

``` typescript
<meta name='application-name' content='PWA App' />
<meta name='apple-mobile-web-app-capable' content='yes' />
<meta name='apple-mobile-web-app-status-bar-style' content='default' />
<meta name='apple-mobile-web-app-title' content='PWA App' />
<meta name='description' content='Best PWA App in the world' />
<meta name='format-detection' content='telephone=no' />
<meta name='mobile-web-app-capable' content='yes' />
<meta name='msapplication-config' content='/static/icons/browserconfig.xml' />
<meta name='msapplication-TileColor' content='#2B5797' />
<meta name='msapplication-tap-highlight' content='no' />
<meta name='theme-color' content='#000000' />
          
<link rel='apple-touch-icon' sizes='180x180' href='/static/icons/apple-touch-icon.png' />
<link rel='icon' type='image/png' sizes='32x32' href='/static/icons/favicon-32x32.png' />
<link rel='icon' type='image/png' sizes='16x16' href='/static/icons/favicon-16x16.png' />
<link rel='manifest' href='/static/manifest.json' />
<link rel='mask-icon' href='/static/icons/safari-pinned-tab.svg' color='#5bbad5' />
<link rel='shortcut icon' href='/static/icons/favicon.ico' />
<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500' />
     
<meta name='twitter:card' content='summary' />
<meta name='twitter:url' content='https://yourdomain.com' />
<meta name='twitter:title' content='PWA App' />
<meta name='twitter:description' content='Best PWA App in the world' />
<meta name='twitter:image' content='https://yourdomain.com/static/icons/android-chrome-192x192.png' />
<meta name='twitter:creator' content='@DavidWShadow' />
<meta property='og:type' content='website' />
<meta property='og:title' content='PWA App' />
<meta property='og:description' content='Best PWA App in the world' />
<meta property='og:site_name' content='PWA App' />
<meta property='og:url' content='https://yourdomain.com' />
<meta property='og:image' content='https://yourdomain.com/static/icons/apple-touch-icon.png' />
```

> Tip:  Put the `viewport` head meta tag into `_app.js` rather than in `_document.js` if you need it.

``` typescript
<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover' />
```

## Usage Without Custom Server (next.js 9+)

Thanks to **Next.js 9+**, we can use the `public` folder to serve static files from the root `/` URL path. It cuts the need to write custom server only to serve those files. Therefore the setup is easier and concise. We can use `next.config.js` to config `next-pwa` to generates service worker and workbox files into the `public` folder.
### withPWA

``` javascript
const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    dest: 'public'
  }
})
```

**[Use this example to see it in action](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-9)**

## Configuration

There are options you can use to customize the behavior of this plugin by adding `pwa` object in the next config in `next.config.js`:

```javascript
const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    register: true,
    scope: '/app',
    sw: 'service-worker.js',
    //...
  }
})
```

### Available Options

- disable: boolean - whether to disable pwa feature as a whole
  - default to `false`
  - set `disable: false`, so that it will generate service worker in both `dev` and `prod`
  - set `disable: true` to completely disable PWA
  - if you don't need to debug service worker in `dev`, you can set `disable: process.env.NODE_ENV === 'development'`
- register: boolean - whether to let this plugin register service worker for you
  - default to `true`
  - set to `false` when you want to handle register service worker yourself, this could be done in `componentDidMount` of your root app. you can consider the [register.js](https://github.com/shadowwalker/next-pwa/blob/master/register.js) as an example.
- scope: string - url scope for pwa
  - default to `/`
  - set to `/app` so that path under `/app` will be PWA while others are not
- sw: string - service worker script file name
  - default to `/sw.js`
  - set to another file name if you want to customize the output file name
- runtimeCaching - caching strategies (array or callback function)
  - default: see the **Runtime Caching** section for the default configuration
  - accepts an array of cache entry objects, [please follow the structure here](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry)
  - Note: the order of the array matters. The first rule that matches is effective. Therefore, please **ALWAYS** put rules with larger scope behind the rules with a smaller and specific scope.
- publicExcludes - an array of glob pattern strings to exclude files in the `public` folder from being precached.
  - default: `[]` - this means that the default behavior will precache all the files inside your `public` folder
  - example: `['!img/super-large-image.jpg', '!fonts/not-used-fonts.otf']`
- buildExcludes - an array of extra pattern or function to exclude files from being precached in `.next/static` (or your custom build) folder
  - default: `[]`
  - example: `[/chunks\/images\/.*$/]` - Don't precache files under `.next/static/chunks/images` (Highly recommend this to work with  `next-optimized-images` plugin)
  - doc: Array of (string, RegExp, or function()). One or more specifiers used to exclude assets from the precache manifest. This is interpreted following the same rules as Webpack's standard exclude option.
- dynamicStartUrl - If your start url returns different HTML document under different state (such as logged in vs. not logged in), this should be set to true.
  - default: true
  - recommend: set to **false** if your start url always returns same HTML document, then start url will be precached, this will help to speed up first load.
- ~~subdomainPrefix: string - url prefix to allow hosting static files on a subdomain~~
  - ~~default: `""` - i.e. default with no prefix~~
  - ~~example: `/subdomain` if the app is hosted on `example.com/subdomain`~~
  - deprecated, use [basePath](https://nextjs.org/docs/api-reference/next.config.js/basepath) instead

### Other Options

`next-pwa` uses `workbox-webpack-plugin`, other options which could also be put in `pwa` object can be found [**ON THE DOCUMENTATION**](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW) and [InjectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest). If you specify `swSrc`, `InjectManifest` plugin will be used, otherwise `GenerateSW` will be used to generate service worker.

### Runtime Caching

`next-pwa` uses a default runtime [cache.js](https://github.com/shadowwalker/next-pwa/blob/master/cache.js)

There is a great chance you may want to customize your own runtime caching rules. Please feel free to copy the default `cache.js` file and customize the rules as you like. Don't forget to inject the configurations into your `pwa` config in `next.config.js`.

Here is the [document on how to write runtime caching configurations](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry), including background sync and broadcast update features and more!

## Tips

1. [Common UX pattern to ask user to reload when new service worker is installed](https://github.com/shadowwalker/next-pwa/blob/master/examples/lifecycle/pages/index.js#L26-L38)
2. Use a convention like `{command: 'doSomething', message: ''}` object when `postMessage` to service worker. So that on the listener, it could do multiple different tasks using `if...else...`.
3. When you are debugging service worker, constantly `clean application cache` to reduce some flaky errors.
4. If you are redirecting the user to another route, please note [workbox by default only cache response with 200 HTTP status](https://developers.google.com/web/tools/workbox/modules/workbox-cacheable-response#what_are_the_defaults), if you really want to cache redirected page for the route, you can specify it in `runtimeCaching` such as `options.cacheableResponse.statuses=[200,302]`.
5. When debugging issues, you may want to format your generated `sw.js` file to figure out what's really going on.
6. Force `next-pwa` to generate worker box production build by specify the option `mode: 'production'` in your `pwa` section of `next.config.js`. Though `next-pwa` automatically generate the worker box development build during development (by running `next`)  and worker box production build during production (by running `next build` and `next start`). You may still want to force it to production build even during development of your web app for following reason:
   1. Reduce logging noise due to production build doesn't include logging.
   2. Improve performance a bit due to production build is optimized and minified.
7. If you just want to disable worker box logging while keeping development build during development, [simply put `self.__WB_DISABLE_DEV_LOGS = true` in your `worker/index.js` (create one if you don't have one)](https://github.com/shadowwalker/next-pwa/blob/c48ef110360d0138ad2dacd82ab96964e3da2daf/examples/custom-worker/worker/index.js#L6).

## Reference

1. [Google Workbox](https://developers.google.com/web/tools/workbox/guides/get-started)
2. [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage) by [Nicolás Bevacqua](https://ponyfoo.com/contributors/ponyfoo)
3. [The Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

## License

MIT
