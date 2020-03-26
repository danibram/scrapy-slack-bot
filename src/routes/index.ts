import { slackMiddleware } from '../middleware'
import actionHandler from './actions'
import { auth } from './auth'
import eventHandler from './events'
import { slashHelp } from './slash.help'
import { slashList } from './slash.list'

export const router = fastify => {
    fastify.route({
        method: 'GET',
        url: '/auth/redirect',
        handler: auth(fastify)
    })

    fastify.route({
        method: 'POST',
        url: '/slack/events',
        preHandler: [slackMiddleware],
        handler: eventHandler(fastify)
    })

    fastify.route({
        method: 'POST',
        url: '/slack/actions',
        preHandler: [slackMiddleware],
        handler: actionHandler(fastify)
    })

    fastify.route({
        method: 'POST',
        url: '/slash/list',
        preHandler: [slackMiddleware],
        handler: slashList(fastify)
    })

    fastify.route({
        method: 'POST',
        url: '/slash/help',
        preHandler: [slackMiddleware],
        handler: slashHelp(fastify)
    })
}
