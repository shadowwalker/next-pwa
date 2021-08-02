# next-pwa - offline fallback example

[TOC]

This example demonstrates how to use `next-pwa` to implement fallback routes for page, image or font when fetch error. Fetch error usually happens when **offline**. (Note fetch is successful even when server returns error codes `404, 400, 500, ...`)

Simply add a `/_offline` page such as `pages/_offline.js` or `pages/_offline.jsx` or `pages/_offline.tsx`. Then you are all set! No configuration needed for this.

You can configure fallback routes for other type of resources

```
pwa: {
  // ...
  fallbacks: {
    image: '/static/images/fallback.png',
    // document: '/other-offline',  // if you want to fallback to a custom    page other than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  // ...
}
```

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/offline-fallback-v2
yarn install
yarn build
yarn start
```

## Recommend `.gitignore`

```
**/public/workbox-*.js
**/public/sw.js
**/public/fallback-*.js
```



