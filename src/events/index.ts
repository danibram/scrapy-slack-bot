import { getToken, slackClient2, storeMsgFile, storeToken, templates } from '../utils';

export default fastify => async (req, rep) => {
    console.log(req.body);

    if (req.body.type === 'url_verification') {
        fastify.log.info(`'url_verification' recieved`);
        return rep
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send({ challenge: req.body.challenge });
    }

    const { token } = await getToken(fastify.mongo.db, req.body['team_id']);

    if (req.body.event.type === 'file_shared') {
        fastify.log.info(`'file_shared' recieved`);

        const sc = slackClient2(token);

        const response = await sc.chat.postMessage({
            channel: req.body.event['channel_id'],
            user: req.body.event['user_id'],
            text: 'Remember to delete your files after use them! Think green!',
            blocks: templates.sharedFileEvent(req.body.event['file_id'])
        });

        if (!response.ok) {
            fastify.log.error(`'file_shared' error ${response.toString()}`);
            return rep.code(400).send();
        }

        await storeMsgFile(fastify.mongo.db, {
            teamId: req.body['team_id'],
            channelId: req.body.event['channel_id'],
            fileId: req.body.event['file_id'],
            ts: (response as any).ts
        });
    }

    if (req.body.event.type === 'file_shared') {
        await storeToken(fastify.mongo.db, {
            ...token,
            deleted: true
        });
    }

    rep.code(200)
        .type('text/plain')
        .send('ok');
};
