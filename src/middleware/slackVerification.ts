import { Unauthorized } from 'http-errors';

export const slackVerification = async (req, reply, done) => {
    if (req.body.token !== process.env.VERIFICATION_TOKEN) {
        throw new Unauthorized('request not coming from slack');
    }
};
