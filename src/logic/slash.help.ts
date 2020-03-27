import { getAccess, replyToBot, templates } from '../utils'

export default async ({ db, log, teamId, responseUrl }) => {
    const access = await getAccess(db, teamId)
    const token = access.userToken ? access.userToken : access.token

    await replyToBot(responseUrl, token, {
        blocks: templates.help()
    })

    log.info(`[/help] OUT`)
}
