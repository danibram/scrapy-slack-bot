import { getAccess, reploToBot, slackClient2, templates } from '../utils'

export const slashList = fastify => async (req, rep) => {
    const ONE_DAY_IN_SECONDS = 86400
    const age = Math.floor(Date.now() / 1000) - 30 * ONE_DAY_IN_SECONDS

    fastify.log.info(`[/list] recieved`)

    const access = await getAccess(fastify.mongo.db, req.body['team_id'])

    const token = access.userToken ? access.userToken : access.token

    const channelId = req.body.channel_id
    const responseUrl = req.body.response_url

    const sc = slackClient2(token)

    const typeFile = req.body.text.split(' ')[0]

    const files = await sc.files
        .list({
            channel: channelId,
            types: typeFile
        })
        .then(body => (body as any).files)

    if (files.length === 0) {
        await reploToBot(responseUrl, token, {
            text: `Nice job little padawan! You have no files${
                typeFile !== 'all' && typeFile ? ` of the type ${typeFile}` : ''
            } on this channel 🎉`
        })

        return rep.code(200).send()
    }

    await reploToBot(responseUrl, token, {
        blocks: templates.listOfFiles(files, typeFile)
    })

    rep.code(200).send()
}
