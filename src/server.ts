import * as fastifySRV from 'fastify'
import * as server from 'fastify'
import prettyRoutes from 'fastify-blipp-log'
import * as helmet from 'fastify-helmet'
import * as staticServer from 'fastify-static'
import * as http from 'http'
import { IncomingMessage, Server, ServerResponse } from 'http'
import * as path from 'path'
import * as qs from 'qs'
import * as rawBody from 'raw-body'
import { router } from './routes'
import { logger } from './utils'
import mongo, { fastifyMongodb } from './utils/mongo'

require('dotenv').config()

declare module 'fastify' {
    interface FastifyInstance<
        HttpServer = http.Server,
        HttpRequest = http.IncomingMessage,
        HttpResponse = http.ServerResponse,
    > {
        mongo: fastifyMongodb.FastifyMongoObject &
            fastifyMongodb.FastifyMongoNestedObject
    }
}

declare let fastifyMongodb: fastifySRV.Plugin<
    http.Server,
    http.IncomingMessage,
    http.ServerResponse,
    fastifyMongodb.FastifyMongodbOptions
>

const fastify: server.FastifyInstance<Server, IncomingMessage, ServerResponse> =
    server({
        logger,
    })

fastify.addContentTypeParser('*', (req, done) => {
    rawBody(
        req,
        {
            length: req.headers['content-length'],
            limit: '1mb', // Remove if you want a buffer
        },
        (err, body) => {
            if (err) return done(err)

            done(null, {
                parsed: qs.parse(body.toString()),
                raw: body,
            })
        },
    )
})

fastify.register(helmet)
fastify.register(prettyRoutes)
fastify.register(mongo, {
    forceClose: true,
    url: process.env.MONGO_URI,
})
fastify.register(staticServer, {
    root: path.join(__dirname, '..', 'public'),
    wildcard: false,
})

router(fastify)

export default ((fastify) => async () => {
    try {
        await fastify.listen(4000, '0.0.0.0')
        fastify.prettyPrintRoutes()
    } catch (err) {
        logger.error(err)
        process.exit(1)
    }
})(fastify)
