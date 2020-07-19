

# next-pwa - lifecycle and register workflow control example

[TOC]

This example demonstrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

It demonstrates how to control the service worker registration workflow (instead automatically register the service worker) and add event listener to handle the lifecycle events. This gives you more control through out the PWA lifecycle. The key here is set `register` option in `next.config.js` to `false`, then call `window.workbox.register()` to register the service worker on your own.

**UPDATE**

It also demonstrate how to implement [prompt user to reload the web app when new version is available](https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users).

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
