# next-pwa - cache on front end navigation example

[TOC]

> **Since `next-pwa@5.2.1`, you can set `cacheOnFrontEndNav: true` in your `pwa` config to achieve the same result in this example, no other code needed.**

This example demonstrates how to use `next-pwa` plugin to solve the issue when users refresh on a front end navigated route while offline and saw browser's connection lost page. This is an edge case which should not happen very often in normal network connectivity areas, however, this example should help you improve the users experience. 

For context, `next.js` embraces both SSR and front end routing (typical SPA) to deliver smooth users experience. However, when a user navigate on the web app through `next/router` or `next/link` (Link component), the navigation is made through front end routing. Which means there is no HTTP GET request made to the server for that route, it only swap the react component to the new page and change the url showed on the url bar. This "fake" navigation is usually desired because it means users do not have to wait for network delay.

However the problem appears when it comes to caching, because there is not request that service worker could intercept, nothing is cached. Users may landing on your home page and navigate to different pages without doing any caching. When the network is lost and users reload these pages using refresh button or re-open the browser, a network lost page from the browser is present, bummer! This behavior could leave users very confused as they could navigated the web app without problem in online and offline, when it come back offline, the web app stopped working.

So we have to enforce a cache for each front-end caching. Yes, it adds additional network traffic which seems conflict of what we are trying to achieve with front end routing. But since the cache happens in service worker, it should have trivial impact on user experience or more specifically, page load.

I personally feel it's a trade off for you to decide whether you want to improve this user experience.

## Related Issue

[A fix for errored offline refreshes #95](https://github.com/shadowwalker/next-pwa/issues/95) (this example idea is based on what @bahumbert suggested)

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/cache-on-front-end-nav
yarn install
yarn build
yarn start
```

## Recommend `.gitignore`

```
**/public/workbox-*.js
**/public/sw.js
**/public/worker-*.js
```



