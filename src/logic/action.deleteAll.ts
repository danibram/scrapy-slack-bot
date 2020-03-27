import { deleteMsgFile, getMsgFile } from '../utils'

export default async ({ log, data, teamId, channelId, messageTs, sc, db }) => {
    const fileIds = data.message.blocks.reduce((acc, val) => {
        if (val.accessory && val.accessory.value) {
            acc.push(val.accessory.value)
        }
        return acc
    }, [])

    const messages = await Promise.all(
        fileIds.map(fileId => getMsgFile(db, teamId, fileId))
    )

    const msgsToDelete = messages.filter(f => f !== null)

    await Promise.all(
        msgsToDelete.map(({ ts, channelId }) =>
            sc.chat.delete({
                channel: channelId,
                ts
            })
        )
    )

    await Promise.all(
        msgsToDelete.map(({ fileId }) => deleteMsgFile(db, teamId, fileId))
    )

    await Promise.all(
        fileIds.map(fileId =>
            sc.files.delete({
                file: fileId
            })
        )
    )

    await sc.chat.delete({
        channel: channelId,
        ts: messageTs
    })

    log.info(`[Action][delete_all] OUT`)
}
