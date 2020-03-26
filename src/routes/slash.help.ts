import { getAccess, reploToBot, templates } from '../utils'

export const slashHelp = fastify => async (req, rep) => {
    fastify.log.info(`[/help] recieved`)

    const teamId = req.body.team_id
    const responseUrl = req.body.response_url

    const access = await getAccess(fastify.mongo.db, teamId)
    const token = access.userToken ? access.userToken : access.token

    await reploToBot(responseUrl, token, {
        blocks: templates.help()
    })

    rep.code(200).send()
}
