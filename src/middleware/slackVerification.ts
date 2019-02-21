import { Unauthorized } from 'http-errors';

export const slackVerification = async req => {
    if (req.body.payload) {
        req.body = JSON.parse(req.body.payload);
    }

    if (req.body['token'] !== process.env.VERIFICATION_TOKEN) {
        throw new Unauthorized('request not coming from slack');
    }
};
