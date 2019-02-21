import {
    deleteMsgFromFileId,
    deleteMsgFromFileIds,
    getToken,
    reploToBot,
    slackClient2
} from '../utils';

export default fastify => async (req, rep) => {
    const data = req.body;

    if (data.type !== 'block_actions' && data.type !== 'message_action') {
        return rep.code(400).send();
    }

    const { token } = await getToken(fastify.mongo.db, data.team.id);

    const sc = slackClient2(token);

    if (data.type === 'message_action' && data.message && data.message.files) {
        await sc.files.delete({
            token: token,
            file: data.message.files[0].id
        });

        await sc.chat.delete({
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
                sc.files.delete({
                    token: token,
                    file: fileId
                })
            )
        );

        await sc.chat.delete({
            channel: data.container.channel_id,
            ts: data.container.message_ts
        });
    }

    if (data.actions && data.actions[0].action_id === 'delete_image_from_event') {
        await sc.files.delete({
            token: token,
            file: data.actions[0].value
        });

        await sc.chat.delete({
            channel: data.container.channel_id,
            ts: data.container.message_ts
        });
    }

    if (data.actions && data.actions[0].action_id === 'delete_image') {
        const fileId = data.actions[0].value;

        await sc.files.delete({
            token: token,
            file: fileId
        });

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
        await sc.chat.delete({
            channel: data.channel.id,
            ts: data.message.ts
        });
    }

    rep.code(200).send();
};
