import { WebClient } from '@slack/web-api'
import axios from 'axios'
import { templates } from '.'

export const slackClient2 = (token?) => new WebClient(token)

export const replyToBot = (responseUrl, token, body) =>
    axios.post(
        responseUrl,
        {
            token,
            replace_original: true,
            delete_original: true,
            response_type: 'in_channel',
            ...body
        },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )

export const postSlackMessage = async (
    sc,
    fileId,
    channelId,
    threadTs,
    imageSize
) =>
    await sc.chat.postMessage({
        channel: channelId,
        text: 'Remember to delete your files after use them! Think green!',
        thread_ts: threadTs,
        blocks: imageSize
            ? templates.sharedFileEventWithInfo(fileId, channelId, imageSize)
            : templates.sharedFileEvent(fileId, channelId)
    })

export const getFileInfo = async (sc, fileId, channelId) => {
    let response: any = await sc.files.info({
        file: fileId
    })

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

    return {
        threadTs: share[channelId][0].ts,
        imageSize: { size: response.file.size, name: response.file.name }
    }
}
