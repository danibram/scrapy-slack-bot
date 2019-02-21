import { slackClient } from './client';
import { deleteMsgFile, getMsgFile } from './db';

export const deleteMsgFromFileId = async (db, token, teamId, fileId) => {
    let message = await getMsgFile(db, teamId, fileId);

    if (message === null) {
        return;
    }
    await slackClient(token, 'chat.delete', {
        token,
        channel: message.channelId,
        ts: message.ts
    });

    await deleteMsgFile(db, teamId, fileId);
};

export const deleteMsgFromFileIds = async (db, token, teamId, fileIds) => {
    const messages = await Promise.all(
        fileIds.map(fileId => getMsgFile(db, teamId, fileId))
    );

    const msgsToDelete = messages.filter(f => f !== null);

    await Promise.all(
        msgsToDelete.map(({ ts, channelId }) =>
            slackClient(token, 'chat.delete', {
                token,
                channel: channelId,
                ts
            })
        )
    );

    await Promise.all(
        msgsToDelete.map(({ fileId }) => deleteMsgFile(db, teamId, fileId))
    );
};
