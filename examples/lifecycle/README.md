# next-pwa - lifecycle and register workflow control example

[TOC]

This example demonstrates how to use the `next-pwa` plugin to turn a `next.js` based web application into a progressive web application (PWA) painlessly.

This example demonstrates how to control the service worker registration workflow (instead of automatically registering the service worker) and add an event listener to handle the lifecycle events. It gives you more control through the PWA lifecycle. The key here is to set the `register` option in `next.config.js` to `false` then call `window.workbox.register()` to register the service worker on your own.

**UPDATE**

This example also demonstrates how to [prompt the user to reload the page when a new version is available](https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users).

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/lifecycle
yarn install
yarn build
yarn start
```

## Recommended `.gitignore`

```
**/public/precache.*.js
**/public/sw.js
```
