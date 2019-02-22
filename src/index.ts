import * as server from 'fastify';
import prettyRoutes from 'fastify-blipp-log';
import * as formBody from 'fastify-formbody';
import * as mongo from 'fastify-mongodb';
import { IncomingMessage, Server, ServerResponse } from 'http';
import actionHandler from './actions';
import eventHandler from './events';
import { slackVerification } from './middleware';
import { getAccess, logger, oauth, reploToBot, slackClient2, templates } from './utils';
import { createAccess, updateAccess } from './utils/db';

require('dotenv').config();

const fastify: server.FastifyInstance<Server, IncomingMessage, ServerResponse> = server({
    logger
});

fastify.register(prettyRoutes);
fastify.register(formBody);
fastify.register(mongo, {
    forceClose: true,
    url: process.env.MONGO_URI
});

fastify.route({
    method: 'GET',
    url: '/',
    handler: (req, rep) => {
        rep.type('text/html').send(templates.slackButton(process.env.CLIENT_ID));
    }
});

fastify.route({
    method: 'GET',
    url: '/auth/redirect',
    handler: async (req, rep) => {
        if (req.query.error && req.query.error === 'access_denied') {
            return rep.send('User was denied permissions');
        }

        const { body } = await oauth({
            code: req.query.code,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
        });

        if (body.ok) {
            fastify.log.info(`Oauth recieved`);

            const token = await getAccess(fastify.mongo.db, body['team_id']);
            const newToken = {
                teamName: body['team_name'],
                teamId: body['team_id'],
                token: body['access_token']
            };

            if (!token) {
                await createAccess(fastify.mongo.db, newToken);
            } else {
                await updateAccess(fastify.mongo.db, body['team_id'], newToken);
            }

            rep.send('Success Scrapy bot was installed in your workspace!');
        } else {
            rep.status(200).send(`Error encountered: \n ${JSON.stringify(body)}`);
        }
    }
});

fastify.route({
    method: 'POST',
    url: '/events',
    beforeHandler: [slackVerification],
    handler: eventHandler(fastify)
});

fastify.route({
    method: 'POST',
    url: '/actions',
    beforeHandler: [slackVerification],
    handler: actionHandler(fastify)
});

fastify.route({
    method: 'POST',
    url: '/slash/list',
    beforeHandler: [slackVerification],
    handler: async (req, rep) => {
        const ONE_DAY_IN_SECONDS = 86400;
        const age = Math.floor(Date.now() / 1000) - 30 * ONE_DAY_IN_SECONDS;

        const { token } = await getAccess(fastify.mongo.db, req.body['team_id']);

        const sc = slackClient2(token);

        const typeFile = req.body.text.split(' ')[0];

        const files = await sc.files
            .list({
                channel: req.body.channel_id,
                types: typeFile
            })
            .then(body => (body as any).files);

        if (files.length === 0) {
            await reploToBot(req.body['response_url'], token, {
                text: `Nice job little padawan! You have no files${
                    typeFile !== 'all' && typeFile ? ` of the type ${typeFile}` : ''
                } on this channel 🎉`
            });

            return rep.code(200).send();
        }

        await reploToBot(req.body['response_url'], token, {
            blocks: templates.listOfFiles(files, typeFile)
        });

        rep.code(200).send();
    }
});

fastify.route({
    method: 'POST',
    url: '/slash/help',
    beforeHandler: [slackVerification],
    handler: async (req, rep) => {
        const ONE_DAY_IN_SECONDS = 86400;
        const age = Math.floor(Date.now() / 1000) - 30 * ONE_DAY_IN_SECONDS;

        const { token } = await getAccess(fastify.mongo.db, req.body['team_id']);

        await reploToBot(req.body['response_url'], token, {
            blocks: templates.help()
        });

        rep.code(200).send();
    }
});

const startServer = async () => {
    try {
        await fastify.listen(4000, '0.0.0.0');
        fastify.prettyPrintRoutes();
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
};

process.on('uncaughtException', error => {
    logger.error(error);
});
process.on('unhandledRejection', error => {
    logger.error(error);
});

startServer();
