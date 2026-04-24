# CHANGELOG

## 7.0.0 — Brainwires fork

First release of the `Brainwires/next-pwa` fork. Version jumps past the stale `@josh.guyette/next-pwa` 6.x line.

### Breaking changes

- **Next.js 14+ required.** Peer range tightened from `>=9.0.0` to `>=14.0.0`; Vercel no longer ships security fixes for Next 12/13.
- **`subdomainPrefix` option removed.** Has been a deprecation warning for years; use `basePath` in `next.config.js` instead.
- **`reloadOnOnline` default flipped from `true` to `false`.** Auto-reloading on reconnect interrupted form input and media playback. Opt back in with `reloadOnOnline: true` if you need the old behavior.
- **Redirect rewrites now gated behind `trustStartUrlRedirects` (default `false`).** `next-pwa` previously rewrote opaque/redirected responses to `200 OK` and cached them under the start-URL key unconditionally. This is safe only when the start URL is guaranteed to redirect within a trusted origin. Consumers that rely on `dynamicStartUrlRedirect` (or any middleware that redirects the start URL) must now set `trustStartUrlRedirects: true` explicitly.

### Fixes

- `fallback.js`: switch statement no longer falls through — a document request with no configured document fallback no longer leaks the image/audio/video/font/data fallback.
- `build-custom-worker.js` / `build-fallback-worker.js`: worker build errors now throw instead of calling `process.exit(-1)`, so they surface through Next.js rather than terminating the user's dev server / CI process.
- App Router: `register.js` is now injected into the `main-app` client entry in addition to `main.js`. App Router apps will actually register the service worker.
- Next.js 16: library detects `process.env.TURBOPACK` and no-ops with a warning, preventing the "webpack config without turbopack config" build failure. PWA still requires `next build --webpack` / `next dev --webpack`.

### Maintenance

- `24 → 0` npm audit vulnerabilities. `serialize-javascript` pinned via `overrides`.
- Deleted the vestigial `webpack.config.js` bundle step (bundle was never referenced — `main` is `index.js`).
- Removed dead `experimental.modern` code path (Next 12 removed the feature 4 years ago).
- Updated workbox to v7.4.
- Fork repository URL, author credit, README.

---

## Pre-fork history (from `shadowwalker/next-pwa`)

**NOTE: for the original project's changelog, see its [release page](https://github.com/shadowwalker/next-pwa/releases).**

## 5.5.0

### Fix

1. Update precache manifest revision to `contenthash` from webpack, [suggested by @ammar-oker](https://github.com/shadowwalker/next-pwa/issues/336)

### Misc

- Update dependencies

### Fix

1. (the real) Fix for not precache server js
2. Fix service worker register url edge case

## 5.4.7

### Fix

1. (the real) Fix for not precache server js
2. Fix service worker register url edge case

## 5.4.6

### Fix

- [fixed buildExcludes options not working](https://github.com/shadowwalker/next-pwa/pull/333)

### Misc

- Update examples and dependencies

## 5.4.5

### Fix

- [Fix double // for precache in static/media](https://github.com/shadowwalker/next-pwa/pull/319)
- [Fixing middleware-runtime.js error](https://github.com/shadowwalker/next-pwa/pull/325)

## 5.4.4

### Misc

- Update examples and dependencies

## 5.4.2

### Fix

- Exclude `middleware-manifest.json` from precache

### Misc

- Update examples and dependencies

## 5.4.0

1. [Add custom worker directory config (@TimoWilhelm)](https://github.com/shadowwalker/next-pwa/pull/282)

## 5.3.2

### Misc

- Update examples and dependencies

## 5.3.1

1. Default range requests for audios and videos

## 5.2.25

### Fix

1. [Add support for pageExtensions](https://github.com/shadowwalker/next-pwa/issues/261)

### Misc

- Update examples and dependencies

## 5.2.24

### Fix

1. [Back online reload behaviour configurable](https://github.com/shadowwalker/next-pwa/issues/232)

## 5.2.23

### Fix

1. Fix double `//` when precache `next/image` url - [Issue 231](https://github.com/shadowwalker/next-pwa/issues/231)

### Misc

- Add `next-image` example

## 5.2.22

### Fix

1. [Fix dynamic routes url encoding issue](https://github.com/shadowwalker/next-pwa/issues/223)
2. Add check for caches before register - @redian
3. Add cross origin cache configuration

### Misc

- Update examples and dependencies

## 5.2.17

### Fix

1. Fix offline page fallback scenario
2. Present offline post page for @next/mdx users
3. Auto reload when app becomes online again

## 5.2.14

### Fix

1. Fix custom worker and offline page not detected in `src` folders issue

## 5.2.12

### Major

1. Add `next-image` runtime cache rules by default

## 5.2.10

### Fix

1. [OAuth workflow in Safari, work out of box with next-auth](https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809)

## 5.2.6

### Fix

1. Fix minor issues

## 5.2.5

### Major

1. Add dependency `terser-webpack-plugin`

## 5.2.4

### Major

1. Fix start url redirect use case

## 5.2.1

### Major

1. Implement cache on front end navigation feature

## 5.2.0

### Major

1. Implement offline fallbacks feature

### Fix

1. Not precache `/_error`

## 5.1.4

### Misc

1. Offline fallback concept with `handlerDidError` cache plugin

### Fix

1. Pass auto offline check in Chrome

## 5.1.3

### Major

1. Fix webpack build on custom worker
2. Support typescript for custom worker - Thanks @felixmosh
3. Support environment variable in custom worker - Thanks @felixmosh

### Misc

- Update examples and dependencies

## 5.0.6

### Major

1. Update workbox depdencies to 6.1.1

### Misc

- Update examples and dependencies

## 5.0.4

### Major

1. Support ES6+ syntax in custom worker

### Misc

- Update examples and dependencies

## 5.0.2

### Major

1. Fix bug for default runtimeCaching not populated
2. Improve log when build custom worker failed

## 5.0.0

### Major

1. Upgrade workbox to 6.0.2
2. Fix modifyURLPrefix config injection
3. Add build id as revision for precache entries

### Misc

- Update examples and dependencies

## 4.0.0.beta.0

### Major

- Upgrade to workbox 6.0.0-rc.0
- Support webpack 5

### Misc

- Update examples and dependencies

## 3.1.5

### Fix

- Fix register script to run on IE11

### Misc

- Update README.md
- Fix typo in logs

## 3.1.4

### Fix

- `viewport` head meta tag not recommended to be put in the `_document.js`

### Misc

- Update `workbox` to `5.1.4`
- Update examples and dependencies
- Add cache on front end navigation example

## 3.1.3

### Fix

- `dev` mode borken due to empty runtime caching and precaching

## 3.1.2

### Misc

- Update examples and dependencies

## 3.1.1

### Fix

- Remove POST api runtime cache from default cache configuration as it's not supported in service worker

## 3.1.0

### Fix

- Fix `register.js` to cache `start-url` when auto register is off
- Give back full control of runtime caching for `start-url`

### Example

- [lifecycle] Update prompt user to reload web app when new version is available

### Misc

- Add more instruction for customizing runtime caching

## 3.0.3

### Fix

- Duplicate `start-url` runtime cache entry in generated `sw.js`

### Example

- Add offline fallback example
- Add web push example

### Misc

- Add CHANGELOG.md
- Add LICENSE and CHANGELOG.md to .npmignore
