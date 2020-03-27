import {
    getAccess,
    getFileInfo,
    getMsgFile,
    go,
    postSlackMessage,
    slackClient2,
    storeMsgFile
} from '../utils'

export default async ({ db, log, fileId, teamId, channelId }) => {
    let access = await getAccess(db, teamId)

    let sc = slackClient2(access.userToken ? access.userToken : access.token)

    let err, data
    ;[err, data] = await go(getMsgFile(db, teamId, fileId))

    if (data) {
        log.warn(`[Event][file_shared] duplicated for ${fileId}`)
    }

    log.info(`Getting file info`)
    ;[err, data] = await go(getFileInfo(sc, fileId, channelId))

    if (err) {
        log.error(err)
    }

    let threadTs = data ? data.threadTs : undefined
    let imageSize = data ? data.imageSize : undefined

    log.info(`[Event][file_shared] Posting Message (as bot)...`)

    sc = slackClient2(access.token)
    ;[err, data] = await go(
        postSlackMessage(sc, fileId, channelId, threadTs, imageSize)
    )

    if (err) {
        log.error(err)

        if (access.userToken) {
            log.info(`[Event][file_shared] Posting Message (as app)...`)
            ;[err, data] = await go(
                postSlackMessage(
                    slackClient2(access.userToken),
                    fileId,
                    channelId,
                    threadTs,
                    imageSize
                )
            )

            if (err) {
                log.error(err)
            }
        } else {
            log.error(`[Event][file_shared] No userToken, no fallback...`)
        }
    }

    if (data && !data.ok) {
        log.error(`[Event][file_shared] error ${data.toString()}`)
    }

    if (!err) {
        log.info(`[Event][file_shared] Storing in DB...`)
        await storeMsgFile(db, {
            teamId: teamId,
            channelId: channelId,
            fileId: fileId,
            threadTs,
            ts: data.ts
        })
    }

    log.info(`[Event][file_shared] OUT`)
}
