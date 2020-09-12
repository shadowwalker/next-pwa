# CHANGELOG

## 3.1.4

### Fix

- `viewport` head meta tag not recommended to be put in the `_document.js`

### Misc

- Update `workbox` to `5.1.4`
- Update examples and dependencies

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