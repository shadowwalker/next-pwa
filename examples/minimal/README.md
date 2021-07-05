# next-pwa - minimal example

[TOC]

This example demonstrates how to use `next-pwa` plugin to turn a `next.js` based web application into a progressive web application easily.

It uses `fastify` as a custom server in order to serve `sw.js` and `precache` script statically, and it contains minimal icon set and a `manifest.json` in static folder. The example also features full offline support and full (all 100) scores on lighthouse report.

> [Check out the lighthouse summary](https://github.com/shadowwalker/next-pwa/blob/master/examples/minimal/lighthouse.pdf), or run the test your self.

## Usage

[![Open in Gitpod](https://img.shields.io/badge/Open%20In-Gitpod.io-%231966D2?style=for-the-badge&logo=gitpod)](https://gitpod.io/#https://github.com/shadowwalker/next-pwa/)

``` bash
cd examples/minimal
yarn install
yarn build
yarn start
```

