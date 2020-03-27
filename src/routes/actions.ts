import { asyncSlack } from '../logic'
import { getAccess, slackClient2 } from '../utils'

export default fastify => async (req, rep) => {
    const data = req.body

    if (data.ssl_check) {
        fastify.log.info(`[Action] SSL check IN`)
        return rep.code(200).send()
    }

    if (data.type !== 'block_actions' && data.type !== 'message_action') {
        fastify.log.warn(`[Action] invalid IN`)
        return rep.code(400).send()
    }

    const access = await getAccess(fastify.mongo.db, data.team.id)

    const token = access.userToken ? access.userToken : access.token

    const sc = slackClient2(token)

    if (data.type === 'message_action' && data.message) {
        fastify.log.info(`[Action][message_action]>[${data.callback_id}] IN`)

        if (data.callback_id === 'delete_image') {
            fastify.log.info(`[Action][message_action][delete_image] IN`)
            asyncSlack.emit('action::delete_image_from_menu', {
                sc,
                log: fastify.log,
                db: fastify.mongo.db,
                data
            })
        }
    }

    if (data.type === 'block_actions' && data.message) {
        let actionId = data.actions[0].action_id
        fastify.log.info(`[Action][block_actions][${actionId}] IN`)

        if (data.actions && actionId === 'delete_all') {
            asyncSlack.emit('action::delete_all', {
                log: fastify.log,
                data,
                teamId: data.team.id,
                channelId: data.container.channel_id,
                messageTs: data.container.message_ts,
                sc,
                db: fastify.mongo.db
            })
        }

        if (data.actions && actionId === 'delete_image_from_event') {
            asyncSlack.emit('action::delete_image_from_event', {
                sc,
                log: fastify.log,
                data
            })
        }

        if (data.actions && actionId === 'delete_image') {
            asyncSlack.emit('action::delete_image', {
                sc,
                log: fastify.log,
                db: fastify.mongo.db,
                data,
                token
            })
        }

        if (data.actions && actionId === 'delete_message') {
            asyncSlack.emit('action::delete_message', {
                sc,
                log: fastify.log,
                data
            })
        }
    }

    rep.code(200).send()
}
