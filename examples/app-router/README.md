# App Router example

Minimal next-pwa integration with the Next.js **App Router**.

Starting with next-pwa 7.0.0, the SW-register script is injected into both the Pages Router (`main.js`) and App Router (`main-app`) client entries, so App Router apps get PWA support out of the box.

## Run

```bash
npm install
npm run build
npm start
```

Then open http://localhost:3000 and verify that `sw.js` is served and registered (see the **Application** tab of DevTools).

## Notes

- Icons are not included in `public/icons/` — add your own, or strip the `icons` entries from `app/layout.js` and `public/manifest.json`.
- Metadata/viewport exports follow the App Router convention (not `<Head>` as in Pages Router).
- On **Next.js 16+**, run with `next build --webpack` / `next dev --webpack` so the webpack-based workbox plugin actually runs; otherwise next-pwa will print a warning and skip SW generation.
