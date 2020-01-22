

# next-pwa - lifecycle and register worflow control example

[TOC]

This example demostrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

It demonstrates how to control the service worker registration workflow (instead automatically register the service worker) and add event listener to handle the lifecycle events. This gives you more control through out the PWA lifecycle. The key here is set `register` option in `next.config.js` to `false`, then call `window.workbox.register()` to register the service worker on your own.

## Usage

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/lifecycle
yarn install
yarn build
yarn start
```

## Recommend `.gitignore`

```
**/public/precache.*.js
**/public/sw.js
```
