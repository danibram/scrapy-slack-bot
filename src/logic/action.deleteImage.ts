import { deleteMsgFile, getMsgFile, replyToBot, templates } from '../utils'

export default async ({ sc, db, log, data, token }) => {
    const fileId = data.actions[0].value
    const teamId = data.team.id

    log.info(`[Action][delete_image] Delete slack file`)
    await sc.files.delete({
        file: fileId
    })

    log.info(`[Action][delete_image] Getting bot msg from db`)
    let message = await getMsgFile(db, teamId, fileId)

    if (message === null) {
        return
    }

    log.info(`[Action][delete_image] Delete bot msg`)
    await sc.chat.delete({
        channel: message.channelId,
        ts: message.ts
    })

    log.info(`[Action][delete_image] Delete bot msg from db`)
    await deleteMsgFile(db, teamId, fileId)

    log.info(`[Action][delete_image] Calculate template`)
    const newBlocks = data.message.blocks.filter(
        b => b.block_id !== data.actions[0].block_id
    )

    const blockImages = newBlocks.filter(
        b => b.accessory && b.accessory.action_id === 'delete_image'
    )

    if (blockImages.length === 0) {
        log.info(`[Action][delete_image] All files deleted`)

        await replyToBot(data.response_url, token, {
            text:
                'Nice job! All files have been deleted. Continue on the light side of the Force!'
        })
    } else {
        newBlocks[
            newBlocks.length - 1
        ].elements[0].text.text = templates.deleteLabel(blockImages.length)

        log.info(`[Action][delete_image] Some files remains`)
        await replyToBot(data.response_url, token, {
            blocks: newBlocks
        })
    }

    log.info(`[Action][delete_image] OUT`)
}
