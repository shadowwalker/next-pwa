

# next-pwa - i18n example

[TOC]

This example demonstrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

It uses `express` to build a custom server and use [`next-i18next`](https://github.com/isaachinman/next-i18next) as a i18n solution.

> The express middleware `i18next-express-middleware` is not compatible with `fastify` right not unfortunately.

Because service worker `sw.js` must be served directly without any redirection, make sure it's route is excluded from the i18n middleware is a bit tricky. Please see `index.js` for more details.

## Usage

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/next-i18next
yarn install
yarn build
yarn start
```

Then try out following path:

```
https://localhost:3000/
https://localhost:3000/en
https://localhost:3000/zh
```

