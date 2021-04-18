# CHANGELOG

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