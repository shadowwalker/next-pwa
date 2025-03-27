# Zero Config PWA Plugin for Next.js

This plugin simplifies adding Progressive Web App (PWA) capabilities to your Next.js application using Workbox and a host of optimized tools. It provides a zero-configuration approach to generating and registering service workers, complete with precaching, runtime caching, custom workers, and incremental manifest generation for improved build performance.

[![Minified Size](https://img.shields.io/bundlephobia/minzip/next-pwa.svg)](https://bundlephobia.com/result?p=next-pwa)  
[![Dependencies](https://img.shields.io/librariesio/release/npm/next-pwa)](https://libraries.io/npm/next-pwa)  
[![Downloads](https://img.shields.io/npm/dw/next-pwa.svg)](https://www.npmjs.com/package/next-pwa)  
[![License](https://img.shields.io/npm/l/next-pwa.svg)](LICENSE)

Share your PWA project [here](https://github.com/shadowwalker/next-pwa/discussions/206).

---

## Features

- **Zero Config:** Minimal setup required to enable PWA features in your Next.js project.
- **Automatic Service Worker Registration:** Automatically injects and registers service workers.
- **Pre-caching & Runtime Caching:** Optimized caching strategies powered by Workbox.
- **Incremental Manifest Generation:** Uses file caching to perform incremental builds, reducing build time in large projects.
- **Offline Support with Fallbacks:** Provides offline pages and fallback responses for various resource types.
- **Custom Worker Support:** Easily extend functionality with custom worker implementations.
- **Advanced Debugging Options:** Enable detailed logging and debug options during development.
- **Fully Configurable:** Customize caching strategies, manifest transformation, and many other settings via plugin options.

---

## Installation

Install the plugin via npm:

```bash
npm install next-pwa
```

---

## Basic Usage

### Step 1: Configure `next.config.js`

Create or update your `next.config.js` to use the plugin. Here’s an example configuration with incremental manifest caching and debug support enabled:

```javascript
// For CommonJS:
const withPWA = require("next-pwa")({
  dest: "public",
  // Enable PWA features only in production (or set to false to always enable)
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "sw.js",
  // Use incremental manifest generation for improved build performance
  enableIncrementalManifest: true,
  // Cache file path for manifest incremental build (default is .next/manifest-cache.json)
  manifestCacheFile: "./.next/manifest-cache.json",
  // Optionally disable the default manifest transform to fully control URL processing
  disableDefaultManifestTransform: false,
  // Pass custom manifest transforms if needed (this is appended to the default transform)
  manifestTransforms: [
    async (entries, compilation) => {
      // Custom transformation: e.g., append query parameter for versioning
      return {
        manifest: entries.map((entry) => ({
          ...entry,
          url: entry.url + "?v=1.0.0",
        })),
        warnings: [],
      };
    },
  ],
  // Fallback configuration for offline support
  fallbacks: {
    document: "/_offline",
    image: "/static/images/fallback.png",
  },
  cacheStartUrl: true,
  dynamicStartUrl: true,
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
  // Enable debug mode for detailed log output (set process.env.DEBUG_PWA=1 to enable)
  debug: process.env.DEBUG_PWA === "1",
  customWorkerDir: "worker",
});

module.exports = withPWA({
  // Your Next.js configuration options
});
```

---

### Step 2: Create a Manifest File

Place a `manifest.json` in your `public` folder. For example:

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

---

### Step 3: Add Head Meta Tags

Ensure your pages include the necessary meta tags for PWA functionality. Add the following to your `_document.js` or `_app.js`:

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
<link
  rel="apple-touch-icon"
  sizes="152x152"
  href="/icons/touch-icon-ipad.png"
/>
<link
  rel="apple-touch-icon"
  sizes="180x180"
  href="/icons/touch-icon-iphone-retina.png"
/>
<link
  rel="apple-touch-icon"
  sizes="167x167"
  href="/icons/touch-icon-ipad-retina.png"
/>

<link
  rel="icon"
  type="image/png"
  sizes="32x32"
  href="/icons/favicon-32x32.png"
/>
<link
  rel="icon"
  type="image/png"
  sizes="16x16"
  href="/icons/favicon-16x16.png"
/>
<link rel="manifest" href="/manifest.json" />
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
<link rel="shortcut icon" href="/favicon.ico" />
```

---

## Offline Fallbacks

To handle offline scenarios, create an `/_offline` page (e.g., `pages/_offline.js`). This page will be served when network requests fail:

```javascript
// pages/_offline.js
export default function OfflinePage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Offline</h1>
      <p>Sorry, it looks like you're offline.</p>
    </div>
  );
}
```

---

## Module System Tutorials

This plugin supports both CommonJS (CJS) and ECMAScript Modules (ESM). Depending on your project configuration, follow the appropriate tutorial:

### Using CommonJS (CJS)

If your project uses CommonJS (the default for many Node.js projects) or you haven't set `"type": "module"` in your `package.json`, then:

- **Importing the Plugin:**

  ```javascript
  // next.config.js using CommonJS
  const withPWA = require("next-pwa")({
    // Your plugin options here...
  });

  module.exports = withPWA({
    // Your Next.js configuration here...
  });
  ```

- **Exporting:**

  The plugin exports using `module.exports`, so you use it as shown above.

### Using ECMAScript Modules (ESM)

If your project uses ESM by setting `"type": "module"` in your `package.json`:

- **Ensure your package.json includes:**

  ```json
  {
    "type": "module"
    // ... other settings
  }
  ```

- **Importing the Plugin:**

  ```javascript
  // next.config.js using ESM
  import withPWA from "next-pwa";

  export default withPWA({
    // Your plugin options here...
  })({
    // Your Next.js configuration here...
  });
  ```

  > **Note:** When using ESM, ensure that your build tool and runtime environment fully support ESM syntax.

---

## Configuration Options

Below is a summary of the available configuration options:

- **dest**: Directory to output service worker files (default: `"public"`).
- **disable**: Disable PWA features (default: `false`). Typically set to `true` in development.
- **register**: Automatically register the service worker (default: `true`).
- **scope**: URL scope for the PWA (default: `"/"`).
- **sw**: Service worker file name (default: `"sw.js"`).
- **runtimeCaching**: Custom caching strategies for runtime requests.
- **publicExcludes**: Array of glob patterns to exclude files from precaching in the `public` directory.
- **buildExcludes**: Array of patterns to exclude files from precaching in the build output.
- **cacheStartUrl**: Cache the start URL (default: `true`).
- **dynamicStartUrl**: Enable dynamic start URL handling (default: `true`).
- **dynamicStartUrlRedirect**: Redirect URL for dynamic start URL caching.
- **fallbacks**: Configure fallback routes for different resource types (e.g., document, image).
- **cacheOnFrontEndNav**: Enable additional caching during front-end navigation (default: `false`).
- **reloadOnOnline**: Reload the page when the network connection is restored (default: `true`).
- **customWorkerDir**: Directory for custom worker implementations (default: `"worker"`).
- **debug**: Enable debug mode for detailed logging (default: `false`).
- **enableIncrementalManifest**: Enable incremental manifest generation to speed up builds (default: `true`).
- **manifestCacheFile**: Path to the cache file for manifest incremental build (default: `".next/manifest-cache.json"`).
- **manifestTransforms**: An array of custom manifest transform functions. These are applied after the default transformation (unless disabled).
- **disableDefaultManifestTransform**: If set to `true`, the default URL transformation logic is not applied.

---

## Advanced Usage

### Custom Workers

For advanced use cases, you can implement custom workers by creating a directory (default: `worker`) in your project root. For example:

```
your-project/
  worker/
    index.js
```

Your custom worker can add additional functionality, which will be bundled and injected into the generated service worker.

### Debugging

- **Debug Logging:** Set `debug: true` in your plugin options (or set the environment variable `DEBUG_PWA=1`) to enable detailed logging during build and runtime.
- **Cache Clearing:** During development, you might need to clear application caches to avoid stale data.
- **Workbox Logs:** To disable Workbox internal logs, you can set `self.__WB_DISABLE_DEV_LOGS = true` in your service worker code.

### Incremental Manifest Caching

The plugin now supports incremental manifest generation. During the first build, all files in the `public` folder are scanned and a cache file is generated. In subsequent builds, only files that have changed will have their revision recalculated, greatly improving build performance in large projects.

---

## Reference

- [Google Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
- [Next.js Documentation](https://nextjs.org/docs)
