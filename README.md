# Zero Config [PWA](https://developers.google.com/web/progressive-web-apps/) Plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [workbox](https://developers.google.com/web/tools/workbox/) and other good stuff.

![size](https://img.shields.io/bundlephobia/minzip/next-pwa.svg) ![dependencies](https://img.shields.io/david/shadowwalker/next-pwa.svg) ![downloads](https://img.shields.io/npm/dw/next-pwa.svg) ![license](https://img.shields.io/npm/l/next-pwa.svg)

**Features**

- Zero config for registering and generating service worker
- Easy to understand examples
- No custom server needed for Next.js 9+ [example here](https://github.com/shadowwalker/next-pwa/tree/master/examples/next-9)
- Completely offline support
- Handle PWA lifecycle events opt-in [example here](https://github.com/shadowwalker/next-pwa/tree/master/examples/lifecycle)
- Use workbox and workbox-window 4.3.1+
- Optimized precache and runtime cache
- Configurable by the same [workbox configuration options](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)
- Spin up a GitPod and try out the examples in rocket speed

> **NOTE** - `next-pwa` version 2.0.0+ should only work with `next.js` 9.1+, and static files should only be served through `public` directory. This will make things simpler.

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

After running `next build`, this will generate two files in your `distDir` (default is `.next` folder): `precache-manifest.*.js` and `sw.js`, which you need to serve statically, either through static file hosting service or using custom `server.js`.

> If you are using Next.js 9+, you may not need a custom server to host your service worker files. Skip to next section to see the details.

### Option 1: Host Static Files

Copy files to your static file hosting server, so that they could be access using URL: `https://yourdomain.com/sw.js` and `https://yourdomain.com/precache-manifest.*.js`.

One example is using firebase hosting service to host those files statically. You can automate the copy step using scripts in your deployment workflow.

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
      
      if (pathname === '/sw.js' || pathname.startsWith('/precache-manifest.')) {
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

> The following setup has nothing to do with `next-pwa` plugin, and you probably have already set them up. If not, go ahead to set them up.

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

## Usage Without Custom Server (next.js 9+, non-serverless only)

Thanks to **Next.js 9+**, we can use `public` folder to serve static files from root `/` url path. It cuts the need to write custom server only to serve those files. Therefore the setup is more easy and concise. We can use `next.config.js` to config `next-pwa` to generates service worker and precache files into `public`folder.

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
    disable: false,
    register: true,
    scope: '/app',
    sw: 'service-worker.js',
    //...
  }
})
```

### Available Options

- disable: boolean - whether to disable pwa feature as a whole
  - default to disabled during `dev`
  - set `disable: false`, so that it will generate service worker in both `dev` and `prod`
  - set `disable: true` to completely disable PWA
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
  - default: see the **Default Runtime Caching** section for the default configuration
  - accept an array of cache configurations
  - **OR** accept a callback function which takes default runtime caching array as parameter, so that you can modify default configurations and return your configurations

### Other Options

`next-pwa` uses `workbox-webpack-plugin`, other options which could also be put in `pwa` object can be find [**ON THE DOCUMENTATION**](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin). If you specify `swSrc`, `InjectManifest` plugin will be used, otherwise `GenerateSW` will be used to generate service worker.

### Default Runtime Caching

``` javascript
const defaultCache = [{
  urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts',
    expiration: {
      maxEntries: 4,
      maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
    }
  }
}, {
  urlPattern: /^https:\/\/use\.fontawesome\.com\/releases\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'font-awesome',
    expiration: {
      maxEntries: 1,
      maxAgeSeconds: 365 * 24 * 60 * 60  // 365 days
    }
  }
}, {
  urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-font-assets',
    expiration: {
      maxEntries: 4,
      maxAgeSeconds: 7 * 24 * 60 * 60  // 7 days
    }
  }
}, {
  urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-image-assets',
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /\.(?:js)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-js-assets',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /\.(?:css|less)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-style-assets',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}, {
  urlPattern: /.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'others',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 24 * 60 * 60  // 24 hours
    }
  }
}]
```

## Tips

// TODO

## License

MIT
