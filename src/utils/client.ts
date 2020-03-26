import { WebClient } from '@slack/web-api'
import axios from 'axios'

export const slackClient2 = (token?) => new WebClient(token)

export const reploToBot = (responseUrl, token, body) =>
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
