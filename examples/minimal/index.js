const { join } = require('path')
const { parse } = require('url')
const fastify = require('fastify')({})
const Next = require('next')
const nextConfig = require('./next.config')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = Next({ dev, conf: nextConfig })

fastify.register(require('fastify-compress'))

fastify.register((fastify, options, next) => {
  app
    .prepare()
    .then(() => {
      fastify.get('/sw.js', (request, reply) => {
        return app.serveStatic(request.req, reply.res, join(__dirname, '.next', 'sw.js')).then(() => {
          reply.sent = true
        })
      })

      fastify.get('/workbox-*.js', (request, reply) => {
        const { pathname } = parse(request.req.url, true)
        return app.serveStatic(request.req, reply.res, join(__dirname, '.next', pathname)).then(() => {
          reply.sent = true
        })
      })

      fastify.get('/*', (request, reply) => {
        return app.handleRequest(request.req, reply.res).then(() => {
          reply.sent = true
        })
      })

      next()
    })
    .catch(err => next(err))
})

fastify.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
