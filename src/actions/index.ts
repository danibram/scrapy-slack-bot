import { Unauthorized } from 'http-errors';
import {
    deleteMsgFromFileId,
    deleteMsgFromFileIds,
    getToken,
    reploToBot,
    slackClient
} from '../utils';

export default fastify => async (req, rep) => {
    const data = JSON.parse(req.body.payload);

    if (data.token !== process.env.VERIFICATION_TOKEN) {
        throw new Unauthorized('request not coming from slack');
    }

    if (data.type !== 'block_actions' && data.type !== 'message_action') {
        return rep.code(400).send();
    }

    const { token } = await getToken(fastify.mongo.db, data.team.id);

    if (data.type === 'message_action' && data.message && data.message.files) {
        await slackClient(token, 'files.delete', {
            token: token,
            file: data.message.files[0].id
        });
        await slackClient(token, 'chat.delete', {
            token,
            channel: data.channel.id,
            ts: data.message_ts
        });
    }

    if (data.actions && data.actions[0].action_id === 'delete_all') {
        const fileIds = data.message.blocks.reduce((acc, val) => {
            if (val.accessory && val.accessory.value) {
                acc.push(val.accessory.value);
            }
            return acc;
        }, []);

        await deleteMsgFromFileIds(fastify.mongo.db, token, data.team.id, fileIds);

        await Promise.all(
            fileIds.map(fileId =>
                slackClient(token, 'files.delete', {
                    token: token,
                    file: fileId
                })
            )
        );

        await slackClient(token, 'chat.delete', {
            token,
            channel: data.container.channel_id,
            ts: data.container.message_ts
        });
    }

    if (data.actions && data.actions[0].action_id === 'delete_image_from_event') {
        const response = await slackClient(token, 'files.delete', {
            token: token,
            file: data.actions[0].value
        });

        if (!response.body.ok) {
            return rep.code(400).send();
        }

        await slackClient(token, 'chat.delete', {
            token,
            channel: data.container.channel_id,
            ts: data.container.message_ts
        });
    }

    if (data.actions && data.actions[0].action_id === 'delete_image') {
        const fileId = data.actions[0].value;

        const response = await slackClient(token, 'files.delete', {
            token: token,
            file: fileId
        });

        if (!response.body.ok) {
            return rep.code(400).send();
        }

        await deleteMsgFromFileId(fastify.mongo.db, token, data.team.id, fileId);

        const newBlocks = data.message.blocks.filter(
            b => b.block_id !== data.actions[0].block_id
        );

        const blockImages = newBlocks.filter(
            b => b.accessory && b.accessory.action_id === 'delete_image'
        );

        if (blockImages.length === 0) {
            await reploToBot(data.response_url, token, {
                text:
                    'Nice job! All files have been deleted. Continue on the light side of the Force!'
            });
        } else {
            await reploToBot(data.response_url, token, {
                blocks: newBlocks
            });
        }
    }

    if (data.actions && data.actions[0].action_id === 'delete_message') {
        await slackClient(token, 'chat.delete', {
            token,
            channel: data.channel.id,
            ts: data.message.ts
        });
    }

    rep.code(200).send();
};
