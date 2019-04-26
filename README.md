# Zero Config [PWA](https://developers.google.com/web/progressive-web-apps/) Plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [workbox](https://developers.google.com/web/tools/workbox/) and other good stuff.

**Features**

- Zero config for registering and generating service worker
- Completely runs offline
- Use workbox and workbox-window 4.3.0+
- Optimized precache and runtime cache
- Configurable by the same [workbox configuration options](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin)

## Install

``` bash
yarn add -D next-pwa
```

## Usage

### withPWA

Update or create `next.config.js` with

``` javascript
const withPWA = require('next-pwa')

module.exports = withPWA({
  // other next config
})
```

After running `next build`, this will generate two files in your `distDir` (default is `.next` folder): `precache-manifest.*.js` and `sw.js`, which you need to serve statically, either through static file hosting service or using custom `server.js`.

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

### Add Manifest File (Example)

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

### Add Head Meta (Example)

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

### Other Options

`next-pwa` uses `workbox-webpack-plugin`, other options which could also be put in `pwa` object can be find [**ON THE DOCUMENTATION**](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin). If you specify `swSrc`, `InjectManifest` plugin will be used, otherwise `GenerateSW` will be used to generate service worker.

## How To

// TODO

## TODO

- [ ] Add examples
- [ ] Support `next export`

## License

MIT











