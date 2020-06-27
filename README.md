# Zero Config [PWA](https://developers.google.com/web/progressive-web-apps/) Plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [workbox](https://developers.google.com/web/tools/workbox/) and other good stuff.

![size](https://img.shields.io/bundlephobia/minzip/next-pwa.svg) ![dependencies](https://img.shields.io/david/shadowwalker/next-pwa.svg) ![downloads](https://img.shields.io/npm/dw/next-pwa.svg) ![license](https://img.shields.io/npm/l/next-pwa.svg)

**Features**

- 0️⃣ Zero config for registering and generating service worker
- 📴 Completely offline support
- 💯 Maximize lighthouse score
- 📦 Use workbox and workbox-window v5
- 🍪 Work with cookies out of the box 
- 🎈 Easy to understand examples
- ☕ No custom server needed for Next.js 9+ [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-9)
- 🔧 Handle PWA lifecycle events opt-in [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/lifecycle)
- 📐 Custom worker to run extra code in service worker with code splitting [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/custom-worker) 🆕
- 🌏 Internationalization (a.k.a I18N) with `next-i18next` [example](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-i18next)
- ✨ Optimized precache and runtime cache
- 🛠 Configurable by the same [workbox configuration options](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW) and [InjectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest)
- 🚀 Spin up a [GitPod](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/) and try out examples in rocket speed
- 🔩 (Experimental) precaching `.module.js` when `next.config.js` has `experimental.modern` set to `true`

> **NOTE** - `next-pwa` version 2.0.0+ should only work with `next.js` 9.1+, and static files should only be served through `public` directory. This will make things simpler.

> **VERSION** `2.3.0`
>
> - service worker runs in dev mode as well, good for debugging functionality with service worker during development
> - custom worker with code splitting, simply write your service worker in `worker/index.js`
> - new option to exclude files in `public` folder from being precached

----

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

## Install

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

Copy files to your static file hosting server, so that they could be access using URL: `https://yourdomain.com/sw.js` and `https://yourdomain.com/workbox-*.js`.

One example is using firebase hosting service to host those files statically. You can automate the copy step using scripts in your deployment workflow.

> For security reason, these files must be hosted directly from your domain. If the content is delivered using a redirect, the browser will refuse to run the service worker.

### Option 2: Use Custom Server

When a http request is received, test if those files are requested, then return those static files.

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
      "type": "image/png"
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

Add following into `_document.jsx` or `_document.tsx`, in `<Head>`:

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
<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover' />
          
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

## Usage Without Custom Server (next.js 9+)

Thanks to **Next.js 9+**, we can use `public` folder to serve static files from root `/` url path. It cuts the need to write custom server only to serve those files. Therefore the setup is more easy and concise. We can use `next.config.js` to config `next-pwa` to generates service worker and workbox files into `public`folder.

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

There are options you can use to customize behavior of this plugin by adding `pwa` object in the next config in `next.config.js`:

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
  - if you don't need debug service worker in `dev`, you can set `disable: process.env.NODE_ENV === 'development'`
- register: boolean - whether to let this plugin register service worker for you
  - default to `true`
  - set to `false` when you want to handle register service worker yourself, this could be done in `componentDidMount` of your root app. you can consider the [register.js](https://github.com/shadowwalker/next-pwa/blob/master/register.js) as an example.
- scope: string - url scope for pwa
  - default to `/`
  - set to `/app`, so that all sub url under `/app` will be PWA, other url paths are still normal web app with no PWA support.
- sw: string - service worker script file name
  - default to `/sw.js`
  - set to other file name if you want to customize the output service worker file name
- runtimeCaching - caching strategies (array or callback function)
  - default: see the **Runtime Caching** section for the default configuration
  - accept an array of cache entry objects, [please follow the structure here](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry)
  - Note: the order in the array matters. The first rule that capture the request wins. Therefore, please **ALWAYS** put rules with larger scope behind the rules with smaller and specific scope.
- publicExcludes - array of glob pattern strings to exclude files in `public` folder being precached.
  - default: `[]` - this means default behavior will precache all the files inside your `public` folder
  - example: `['!img/super-large-image.jpg', '!fonts/not-used-fonts.otf']`
- buildExcludes - array of extra pattern or function to exclude files for precaching in `.next/static` (or your custom build) folder
  - default: `[]`
  - example: `[/chunks\/images\/.*$/]` - Don't precache all files under `.next/static/chunks/images` (Highly recommend this to work with  `next-optimized-images` plugin)
  - doc: Array of (string, RegExp, or function()). One or more specifiers used to exclude assets from the precache manifest. This is interpreted following the same rules as webpack's standard exclude option.
- subdomainPrefix: string - url prefix to allow hosting static files on a subdomain
  - default: `""` - i.e. default with no prefix
  - example: `/subdomain` if the app is hosted on `example.com/subdomain`

### Other Options

`next-pwa` uses `workbox-webpack-plugin`, other options which could also be put in `pwa` object can be find [**ON THE DOCUMENTATION**](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) for [GenerateSW](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW) and [InjectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest). If you specify `swSrc`, `InjectManifest` plugin will be used, otherwise `GenerateSW` will be used to generate service worker.

### Runtime Caching

`next-pwa` uses a default runtime [cache.js](https://github.com/shadowwalker/next-pwa/blob/master/cache.js)

There is a great chance you may want to customize your own runtime caching rule. Please feel free to copy the default `cache.js` file and customize the rules as you like. And don't forget to inject the configurations into your `pwa` config in `next.config.js`.

Here is the [document on how to write runtime caching configurations](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry), including background sync and broadcast update features and more!

## Tips

1. [Common UX pattern to ask user to reload when new service worker is installed](https://github.com/shadowwalker/next-pwa/blob/master/examples/lifecycle/pages/index.js#L26-L38)
2. Use a convention like `{command: 'doSomething', message: ''}` object when `postMessage` to service worker. So that on the listener, it could do multiple different tasks using `if...else...`.
3. When you debugging service worker, constantly `clean application cache` to reduce some flaky errors.
4. If you are redirecting user to another route, please note [workbox by default only cache response with 200 HTTP status](https://developers.google.com/web/tools/workbox/modules/workbox-cacheable-response#what_are_the_defaults), if you really want to cache redirected page for the route, you can specify it in `runtimeCaching` such as `options.cacheableResponse.statuses=[200,302]`.
5. When debugging issue, you may want to format your generated `sw.js` file to figure out what's really going on.

## Reference

1. [Google Workbox](https://developers.google.com/web/tools/workbox/guides/get-started)
2. [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage) by [Nicolás Bevacqua](https://ponyfoo.com/contributors/ponyfoo)

## License

MIT
