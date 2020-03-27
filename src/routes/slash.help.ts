import { asyncSlack } from '../logic'

export const slashHelp = fastify => async (req, rep) => {
    fastify.log.info(`[/help] IN`)

    const { response_url: responseUrl, team_id: teamId } = req.body

    asyncSlack.emit('slash::help', {
        db: fastify.mongo.db,
        log: fastify.log,
        teamId,
        responseUrl
    })

    rep.code(200).send()
}
