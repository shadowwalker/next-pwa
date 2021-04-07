

# next-pwa - next.js 9+ example

[TOC]

This example demonstrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

Thanks to **Next.js 9+**, we can use `public` folder to serve static files from root url path. It cuts the need to write custom server only to serve those files. Therefore the setup is more easy and concise. We can use `next.config.js` to config `next-pwa` to generates service worker and precache files into `public` folder.

> [Check out the lighthouse summary](https://github.com/shadowwalker/next-pwa/blob/master/examples/next-9/lighthouse.pdf), or run the test your self.

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/next-9
yarn install
yarn build
yarn start
```

## Recommend `.gitignore`

```
**/public/workbox-*.js
**/public/sw.js
```



