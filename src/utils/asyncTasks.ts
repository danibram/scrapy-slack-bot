import { EventEmitter } from 'events'
import { deleteMsgFile, getMsgFile } from '.'

export const asyncSlack = new EventEmitter()

// listen to the event
asyncSlack.on(
    'delete_all',
    async ({ fileIds, teamId, channelId, messageTs, sc, db }) => {
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
    }
)
