export const storeToken = (db, { teamId, token }) =>
    db.collection('tokens').insertOne({ teamId, token });
export const getToken = (db, teamId) => db.collection('tokens').findOne({ teamId });
export const storeMsgFile = (db, { teamId, channelId, fileId, ts }) =>
    db.collection('event-files').insertOne({ teamId, channelId, fileId, ts });
export const getMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').findOne({ teamId, fileId });
export const deleteMsgFile = (db, teamId, fileId) =>
    db.collection('event-files').deleteOne({ teamId, fileId });
