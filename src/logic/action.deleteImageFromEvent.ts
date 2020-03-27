import { go, templates } from '../utils'

export default async ({ sc, log, data }) => {
    const [fileId, channelId] = templates.decomposeVal(data.actions[0].value)

    let err, response

    log.info(`[Action][delete_image_from_event] Delete Image`)
    ;[err, response] = await go(
        sc.files.delete({
            file: fileId
        })
    )
    if (err) {
        log.error(err)
    }

    log.info(`[Action][delete_image_from_event] Delete bot msg`)
    ;[err, response] = await go(
        sc.chat.delete({
            channel: data.container.channel_id,
            ts: data.container.message_ts
        })
    )
    if (err) {
        log.error(err)
    }

    log.info(`[Action][delete_image_from_event] OUT`)
}
