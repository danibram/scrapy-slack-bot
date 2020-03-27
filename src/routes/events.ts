import { asyncSlack } from '../logic'

export default fastify => async (req, rep) => {
    if (req.body.type === 'url_verification') {
        fastify.log.info(`[Event][url_verification] IN`)
        return rep
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ challenge: req.body.challenge })
    }

    const {
        team_id: teamId,
        event: { type: eventType }
    } = req.body

    fastify.log.info(`[Event][${eventType}] IN`)

    if (eventType === 'file_shared') {
        const { channel_id: channelId, file_id: fileId } = req.body.event

        asyncSlack.emit('event::file_shared', {
            db: fastify.mongo.db,
            log: fastify.log,
            fileId,
            teamId,
            channelId
        })
    }

    if (eventType === 'app_uninstalled') {
        asyncSlack.emit('event::app_uninstalled', {
            db: fastify.mongo.db,
            teamId
        })
    }

    rep.code(200)
        .type('text/plain')
        .send('ok')
}
