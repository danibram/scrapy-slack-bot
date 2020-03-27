import { getAccess, replyToBot, slackClient2, templates } from '../utils'

export default async ({ db, log, teamId, channelId, responseUrl, text }) => {
    const access = await getAccess(db, teamId)

    const token = access.userToken ? access.userToken : access.token

    const sc = slackClient2(token)

    const typeFile = text.split(' ')[0]

    const files = await sc.files
        .list({
            channel: channelId,
            types: !typeFile || typeFile === 'all' ? undefined : typeFile
        })
        .then(body => (body as any).files)

    if (files.length === 0) {
        await replyToBot(responseUrl, token, {
            text: `Nice job little padawan! You have no files${
                typeFile !== 'all' && typeFile ? ` of the type ${typeFile}` : ''
            } on this channel 🎉`
        })
    } else {
        await replyToBot(responseUrl, token, {
            blocks: templates.listOfFiles(files, typeFile)
        })
    }

    log.info(`[/list] OUT`)
}
