export const listOfFiles = (files, typeFile) => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `😱 *Woha!* I found these files${
                typeFile !== 'all' && typeFile
                    ? ` of the type _${typeFile}_`
                    : ''
            }`
        }
    },
    {
        type: 'divider'
    },
    ...files.map(file => ({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `${file.name} (${file.size} bytes)`
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'Delete',
                emoji: true
            },
            value: file.id,
            action_id: 'delete_image'
        }
    })),
    {
        type: 'divider'
    },
    {
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    emoji: true,
                    text: deleteLabel(files.length)
                },
                action_id: 'delete_all'
            },
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    emoji: true,
                    text: `Delete this message`
                },
                action_id: 'delete_message'
            }
        ]
    }
]
export const help = () => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `*List of parameters*`
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `- *typeOfFile* Search files by this type, multiple values like 'spaces,snippets'. Default: 'all'. Possible values:
        - *all* : All files
        - *spaces* : Posts
        - *snippets* : Snippets
        - *images* : Image files
        - *gdocs* : Google docs
        - *zips* : Zip files
        - *pdfs* : PDF files
`
        }
    }
]

export const sharedFileEvent = (fileId, channelId) => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `Remember to delete your files after use them! Think green! 🌳`
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'Delete file',
                emoji: true
            },
            value: composeVal(fileId, channelId),
            action_id: 'delete_image_from_event'
        }
    }
]

export const sharedFileEventWithInfo = (fileId, channelId, { size, name }) => [
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `${name} (${size} bytes)`
        }
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `Remember to delete your files after use them! Think green! 🌳`
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'Delete file',
                emoji: true
            },
            value: composeVal(fileId, channelId),
            action_id: 'delete_image_from_event'
        }
    }
]

export const SEPARATOR = '@@'
export const composeVal = (fileId, channelId) =>
    `${fileId}${SEPARATOR}${channelId}`
export const decomposeVal = str => str.split(SEPARATOR)
export const deleteLabel = number => `Delete all ${number}`
