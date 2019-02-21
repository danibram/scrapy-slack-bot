import { Unauthorized } from 'http-errors';
import { getToken, slackClient, storeMsgFile, templates } from '../utils';

export default fastify => async (req, rep) => {
    console.log(req.body);

    if (req.body.token !== process.env.VERIFICATION_TOKEN) {
        throw new Unauthorized('request not coming from slack');
    }

    if (req.body.type === 'url_verification') {
        fastify.log.info(`'url_verification' recieved`);
        return rep
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ challenge: req.body.challenge });
    }

    if (req.body.event.type === 'file_shared') {
        fastify.log.info(`'file_shared' recieved`);
        const { token } = await getToken(fastify.mongo.db, req.body['team_id']);

        const response = await slackClient(token, 'chat.postMessage', {
            token,
            channel: req.body.event['channel_id'],
            user: req.body.event['user_id'],
            text: 'Remember to delete your files after use them! Think green!',
            blocks: JSON.stringify(templates.sharedFileEvent(req.body.event['file_id']))
        });

        if (!response.body.ok) {
            fastify.log.error(`'file_shared' error ${response.body.toString()}`);
            return rep.code(400).send();
        }

        await storeMsgFile(fastify.mongo.db, {
            teamId: req.body['team_id'],
            channelId: req.body.event['channel_id'],
            fileId: req.body.event['file_id'],
            ts: response.body.ts
        });
    }

    rep.code(200)
        .type('text/plain')
        .send('ok');
};
