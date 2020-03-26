import {
    deleteMsgFile,
    getAccess,
    getMsgFile,
    reploToBot,
    slackClient2,
    templates
} from '../../utils'
import { asyncSlack } from '../../utils/asyncTasks'

export default fastify => async (req, rep) => {
    const data = req.body

    if (data.ssl_check) {
        fastify.log.info(`[Action] SSL check recieved`)
        return rep.code(200).send()
    }

    if (data.type !== 'block_actions' && data.type !== 'message_action') {
        fastify.log.warn(`[Action] invalid recieved`)
        return rep.code(400).send()
    }

    const access = await getAccess(fastify.mongo.db, data.team.id)

    const token = access.userToken ? access.userToken : access.token

    const sc = slackClient2(token)

    if (data.type === 'message_action' && data.message && data.message.files) {
        fastify.log.info(`[Action] 'message_action' recieved`)

        await sc.files.delete({
            token: token,
            file: data.message.files[0].id
        })

        await sc.chat.delete({
            channel: data.channel.id,
            ts: data.message_ts
        })
    }

    if (data.actions && data.actions[0].action_id === 'delete_all') {
        fastify.log.info(`[Action] 'delete_all' recieved`)

        const fileIds = data.message.blocks.reduce((acc, val) => {
            if (val.accessory && val.accessory.value) {
                acc.push(val.accessory.value)
            }
            return acc
        }, [])

        asyncSlack.emit('delete_all', {
            fileIds,
            teamId: data.team.id,
            channelId: data.container.channel_id,
            messageTs: data.container.message_ts,
            sc,
            db: fastify.mongo.db
        })
    }

    if (
        data.actions &&
        data.actions[0].action_id === 'delete_image_from_event'
    ) {
        fastify.log.info(`[Action] 'delete_image_from_event' recieved`)

        const [fileId, channelId] = templates.decomposeVal(
            data.actions[0].value
        )

        await sc.files.delete({
            file: fileId
        })

        await sc.chat.delete({
            channel: data.container.channel_id,
            ts: data.container.message_ts
        })
    }

    if (data.actions && data.actions[0].action_id === 'delete_image') {
        fastify.log.info(`[Action] 'delete_image' recieved`)

        const fileId = data.actions[0].value
        const teamId = data.team.id
        const db = fastify.mongo.db

        await sc.files.delete({
            file: fileId
        })

        let message = await getMsgFile(db, teamId, fileId)

        if (message === null) {
            return
        }

        await sc.chat.delete({
            channel: message.channelId,
            ts: message.ts
        })

        await deleteMsgFile(db, teamId, fileId)

        const newBlocks = data.message.blocks.filter(
            b => b.block_id !== data.actions[0].block_id
        )

        const blockImages = newBlocks.filter(
            b => b.accessory && b.accessory.action_id === 'delete_image'
        )

        if (blockImages.length === 0) {
            await reploToBot(data.response_url, token, {
                text:
                    'Nice job! All files have been deleted. Continue on the light side of the Force!'
            })
        } else {
            newBlocks[
                newBlocks.length - 1
            ].elements[0].text.text = templates.deleteLabel(blockImages.length)

            console.log(newBlocks)

            await reploToBot(data.response_url, token, {
                blocks: newBlocks
            })
        }
    }

    if (data.actions && data.actions[0].action_id === 'delete_message') {
        fastify.log.info(`[Action] 'delete_message' recieved`)
        await sc.chat.delete({
            channel: data.channel.id,
            ts: data.message.ts
        })
    }

    rep.code(200).send()
}
