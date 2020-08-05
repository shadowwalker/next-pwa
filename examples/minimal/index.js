const { join } = require('path')
const { parse } = require('url')
const fs = require('fs')
const fastify = require('fastify')({
  logger: false
})
const Next = require('next')
const nextConfig = require('./next.config')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

const swJs = fs.readFileSync(join(__dirname, '.next', 'sw.js'))
let workboxJs

fastify.register(require('fastify-compress'))

fastify.register((fastify, options, next) => {
  const app = Next({ dev, conf: nextConfig })
  const handle = app.getRequestHandler()
  app
    .prepare()
    .then(() => {
      fastify.get('/sw.js', (request, reply) => {
        reply.type('application/javascript').send(swJs)
      })

      fastify.get('/workbox-*.js', (request, reply) => {
        const { pathname } = parse(request.raw.url, true)
        if (!workboxJs) workboxJs = fs.readFileSync(join(__dirname, '.next', pathname))
        reply.type('application/javascript').send(workboxJs)
      })

      fastify.all('/*', (request, reply) => {
        return handle(request.raw, reply.raw).then(() => {
          reply.sent = true
        })
      })

      fastify.setNotFoundHandler((request, reply) => {
        return app.render404(request.raw, reply.raw).then(() => {
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
