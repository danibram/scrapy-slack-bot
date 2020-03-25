import {
    getAccess,
    slackClient2,
    storeMsgFile,
    templates,
    updateAccess
} from "../utils";

export default fastify => async (req, rep) => {
    if (req.body.type === "url_verification") {
        fastify.log.info(`'url_verification' recieved`);
        return rep
            .code(200)
            .header("Content-Type", "application/json; charset=utf-8")
            .send({ challenge: req.body.challenge });
    }

    let access = await getAccess(fastify.mongo.db, req.body["team_id"]);

    if (req.body.event.type === "file_shared") {
        fastify.log.info(`'file_shared' recieved`);

        const sc = slackClient2(access.token);
        const channelId = req.body.event["channel_id"];

        let thread_ts = null;
        try {
            fastify.log.info(`Getting file info`);
            let response: any = await sc.files.info({
                file: req.body.event.file.id
            });

            if (!response.file.shares.private && !response.file.shares.public) {
                throw new Error(
                    `Not public, private in response.file.shares ${Object.keys(
                        response.file.shares
                    )}`
                );
            }

            let share = response.file.shares.private
                ? response.file.shares.private
                : response.file.shares.public;

            if (!share[channelId]) {
                throw new Error(
                    `No file in this channel ${Object.keys(share)}`
                );
            }

            if (!share[channelId]) {
                throw new Error(
                    `No file in this channel ${Object.keys(share)}`
                );
            }

            thread_ts = share[channelId][0].ts;
        } catch (e) {
            fastify.log.error(e);
            fastify.log.error(e.message);
        }

        fastify.log.info(`Posting Message...`);
        const response = await sc.chat.postMessage({
            channel: req.body.event["channel_id"],
            text: "Remember to delete your files after use them! Think green!",
            thread_ts,
            blocks: templates.sharedFileEvent(req.body.event["file_id"])
        });

        if (!response.ok) {
            fastify.log.error(`'file_shared' error ${response.toString()}`);
            return rep.code(400).send();
        }

        await storeMsgFile(fastify.mongo.db, {
            teamId: req.body["team_id"],
            channelId: req.body.event["channel_id"],
            fileId: req.body.event["file_id"],
            threadTs: thread_ts,
            ts: (response as any).ts
        });
    }

    if (req.body.event.type === "app_uninstalled") {
        await updateAccess(fastify.mongo.db, req.body["team_id"], {
            ...access,
            deleted: true
        });
    }

    rep.code(200)
        .type("text/plain")
        .send("ok");
};
