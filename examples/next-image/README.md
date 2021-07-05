# next-pwa - next-image example

[TOC]

This example demonstrates best practices to serve your images through `next.js` built-in image serving feature.

For best performance, put images in it's own folder other than `public`. This is prevent duplicate precaching entries in the `sw.js` service worker script. Then `import Image from 'next/image'` to use the `Image` component provided from `next.js` in your app.

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/next-image
yarn install
yarn build
yarn start
```

## Recommend `.gitignore`

```
**/public/workbox-*.js
**/public/sw.js
```



