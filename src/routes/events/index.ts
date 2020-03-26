import {
    getAccess,
    slackClient2,
    storeMsgFile,
    templates,
    updateAccess
} from '../../utils'

export default fastify => async (req, rep) => {
    if (req.body.type === 'url_verification') {
        fastify.log.info(`[Events] 'url_verification' recieved`)
        return rep
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ challenge: req.body.challenge })
    }

    const teamId = req.body['team_id']

    let access = await getAccess(fastify.mongo.db, teamId)

    if (req.body.event.type === 'file_shared') {
        fastify.log.info(`[Events] 'file_shared' recieved`)

        const sc = slackClient2(
            access.userToken ? access.userToken : access.token
        )
        const channelId = req.body.event['channel_id']
        const fileId = req.body.event['file_id']

        console.log(req.body.event)

        let thread_ts = undefined
        let imageSize = undefined

        try {
            fastify.log.info(`Getting file info`)
            let response: any = await sc.files.info({
                file: req.body.event.file.id
            })

            imageSize = { size: response.file.size, name: response.file.name }

            if (!response.file.shares.private && !response.file.shares.public) {
                throw new Error(
                    `Not public, private in response.file.shares ${Object.keys(
                        response.file.shares
                    )}`
                )
            }

            let share = response.file.shares.private
                ? response.file.shares.private
                : response.file.shares.public

            if (!share[channelId]) {
                throw new Error(`No file in this channel ${Object.keys(share)}`)
            }

            if (!share[channelId]) {
                throw new Error(`No file in this channel ${Object.keys(share)}`)
            }

            thread_ts = share[channelId][0].ts
        } catch (e) {
            fastify.log.error(e)
            fastify.log.error(e.message)
        }

        fastify.log.info(`Posting Message...`)

        try {
            const sc = slackClient2(access.token)

            const response = await sc.chat.postMessage({
                channel: channelId,
                text:
                    'Remember to delete your files after use them! Think green!',
                thread_ts,
                blocks: imageSize
                    ? templates.sharedFileEventWithInfo(
                          fileId,
                          channelId,
                          imageSize
                      )
                    : templates.sharedFileEvent(fileId, channelId)
            })

            if (!response.ok) {
                fastify.log.error(
                    `[Events] 'file_shared' error ${response.toString()}`
                )
                return rep.code(400).send()
            }

            await storeMsgFile(fastify.mongo.db, {
                teamId: teamId,
                channelId: channelId,
                fileId: fileId,
                threadTs: thread_ts,
                ts: (response as any).ts
            })
        } catch (e) {
            fastify.log.error(e)
            fastify.log.error(e.message)

            if (access.userToken) {
                const sc = slackClient2(access.userToken)

                const response = await sc.chat.postMessage({
                    channel: channelId,
                    text:
                        'Remember to delete your files after use them! Think green!',
                    thread_ts,
                    blocks: imageSize
                        ? templates.sharedFileEventWithInfo(
                              fileId,
                              channelId,
                              imageSize
                          )
                        : templates.sharedFileEvent(fileId, channelId)
                })

                if (!response.ok) {
                    fastify.log.error(
                        `[Events] 'file_shared' error ${response.toString()}`
                    )
                    return rep.code(400).send()
                }

                await storeMsgFile(fastify.mongo.db, {
                    teamId: teamId,
                    channelId: channelId,
                    fileId: fileId,
                    threadTs: thread_ts,
                    ts: (response as any).ts
                })
            }
        }
    }

    if (req.body.event.type === 'app_uninstalled') {
        fastify.log.info(`[Events] 'file_shared' recieved`)
        await updateAccess(fastify.mongo.db, teamId, {
            ...access,
            deleted: true
        })
    }

    rep.code(200)
        .type('text/plain')
        .send('ok')
}
