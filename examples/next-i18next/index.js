const { join } = require('path')
const { parse } = require('url')
const express = require('express')
const Next = require('next')
const nextI18NextMiddleware = require('next-i18next/middleware').default
const nextI18next = require('./i18n')
const nextConfig = require('./next.config')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = Next({ dev, conf: nextConfig })
const handle = app.getRequestHandler()
const server = express()

app.prepare().then(async () => {
  server.get('/sw.js', (req, res) => {
    return app.serveStatic(req, res, join(__dirname, '.next', 'sw.js'))
  })

  server.get('/workbox-*.js', (req, res) => {
    const { pathname } = parse(req.path, true)
    return app.serveStatic(req, res, join(__dirname, '.next', pathname))
  })

  // static resources should not be redirected by i18n middleware to same network trip
  // highly recommend add any extension of static resources here, though it would still work if you don't
  server.all(/\.(js|json|png|jpg|ico)$/i, (req, res) => {
    return handle(req, res)
  })

  // make sure nextI18next is initiated
  await nextI18next.initPromise
  // use the i18n middleware for any other routes
  server.all('*', nextI18NextMiddleware(nextI18next), (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
