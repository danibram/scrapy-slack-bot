import { asyncSlack } from '../logic'

export const slashList = fastify => async (req, rep) => {
    const ONE_DAY_IN_SECONDS = 86400
    const age = Math.floor(Date.now() / 1000) - 30 * ONE_DAY_IN_SECONDS

    fastify.log.info(`[/list] IN`)

    const {
        channel_id: channelId,
        response_url: responseUrl,
        team_id: teamId,
        text
    } = req.body

    asyncSlack.emit('slash::list', {
        db: fastify.mongo.db,
        log: fastify.log,
        teamId,
        channelId,
        responseUrl,
        text
    })

    rep.code(200).send()
}
