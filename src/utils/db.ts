import { DateTime } from 'luxon';

export const storeToken = (db, { teamId, token, teamName, deleted }) =>
    db
        .collection('tokens')
        .findOneAndReplace(
            { teamId },
            {
                teamId,
                token,
                teamName,
                deleted: deleted ? deleted : false,
                createdAt: DateTime.utc().toISO()
            }
        );

export const getToken = (db, teamId) => db.collection('tokens').findOne({ teamId });
export const storeMsgFile = (db, { teamId, channelId, fileId, ts }) =>
    db
        .collection('event-files')
        .insertOne({ teamId, channelId, fileId, ts, createdAt: DateTime.utc().toISO() });
export const getMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').findOne({ teamId, fileId });
export const deleteMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').deleteOne({ teamId, fileId });
