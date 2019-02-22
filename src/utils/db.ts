import { DateTime } from 'luxon';

export const createAccess = (db, { teamId, token, teamName }) =>
    db.collection('tokens').insertOne({
        teamId,
        token,
        teamName,
        createdAt: DateTime.utc().toISO(),
        updateAt: DateTime.utc().toISO()
    });

export const updateAccess = (db, teamId, token) =>
    db.collection('tokens').findOneAndReplace(
        { teamId },
        {
            ...token,
            updateAt: DateTime.utc().toISO()
        }
    );

export const getAccess = (db, teamId) => db.collection('tokens').findOne({ teamId });

export const storeMsgFile = (db, { teamId, channelId, fileId, ts }) =>
    db
        .collection('event-files')
        .insertOne({ teamId, channelId, fileId, ts, createdAt: DateTime.utc().toISO() });
export const getMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').findOne({ teamId, fileId });
export const deleteMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').deleteOne({ teamId, fileId });
