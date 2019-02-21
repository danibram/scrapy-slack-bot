import { slackClient2 } from './client';
import { deleteMsgFile, getMsgFile } from './db';

export const deleteMsgFromFileId = async (db, token, teamId, fileId) => {
    const sc = slackClient2(token);

    let message = await getMsgFile(db, teamId, fileId);

    if (message === null) {
        return;
    }

    await sc.chat.delete({
        channel: message.channelId,
        ts: message.ts
    });

    await deleteMsgFile(db, teamId, fileId);
};

export const deleteMsgFromFileIds = async (db, token, teamId, fileIds) => {
    const sc = slackClient2(token);

    const messages = await Promise.all(
        fileIds.map(fileId => getMsgFile(db, teamId, fileId))
    );

    const msgsToDelete = messages.filter(f => f !== null);

    await Promise.all(
        msgsToDelete.map(({ ts, channelId }) =>
            sc.chat.delete({
                channel: channelId,
                ts
            })
        )
    );

    await Promise.all(
        msgsToDelete.map(({ fileId }) => deleteMsgFile(db, teamId, fileId))
    );
};
