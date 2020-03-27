import { deleteMsgFile, getMsgFile, go } from '../utils'

export default async ({ sc, log, db, data }) => {
    let err, response

    const fileId = data.message.files[0].id
    const teamId = data.team.id

    log.info(`[Action][message_action][delete_image] Getting bot msg from db`)
    let message = await getMsgFile(db, teamId, fileId)

    log.info(`[Action][message_action][delete_image] Delete File`)
    ;[err, response] = await go(
        sc.files.delete({
            file: fileId
        })
    )
    if (err) {
        log.error(err)
    }

    log.info(`[Action][message_action][delete_image] Delete bot msg`)
    ;[err, response] = await go(
        sc.chat.delete({
            channel: message.channelId,
            ts: message.ts
        })
    )
    if (err) {
        log.error(err)
    }

    log.info(`[Action][message_action][delete_image] Delete bot msg from db`)
    ;[err, response] = await go(deleteMsgFile(db, teamId, fileId))
    if (err) {
        log.error(err)
    }

    log.info(`[Action][message_action][delete_image] OUT`)
}
