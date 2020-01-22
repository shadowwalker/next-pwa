

# next-pwa - minimal example

[TOC]

This example demostrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

It uses `fastify` as a custom server in order to serve `sw.js` and `precache` script statically, and it contains minimal icon set and a `manifest.json` in static folder. The example also features full offline support and full (all 100) scores on lighthouse report.

> [Check out the lighthouse summary](https://github.com/shadowwalker/next-pwa/blob/master/examples/minimal/lighthouse.pdf), or run the test your self.

## Usage

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/minimal
yarn install
yarn build
yarn start
```

