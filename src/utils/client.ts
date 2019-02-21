import { WebClient } from '@slack/client';
import * as got from 'got';

const slackBase = 'https://slack.com/api';

export const slackClient2 = token => new WebClient(token);

export const oauth = ({ code, clientId, clientSecret, redirectUri }) =>
    got(
        `${slackBase}/oauth.access?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}`,
        { json: true }
    );

export const reploToBot = (responseUrl, token, body) =>
    got(responseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        method: 'POST',
        body: JSON.stringify({
            token,
            replace_original: true,
            delete_original: true,
            response_type: 'in_channel',
            ...body
        })
    });
