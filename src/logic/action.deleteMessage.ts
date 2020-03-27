export default async ({ sc, log, data }) => {
    await sc.chat.delete({
        channel: data.channel.id,
        ts: data.message.ts
    })
    log.info(`[Action][delete_message] OUT`)
}
