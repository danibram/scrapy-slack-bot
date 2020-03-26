import { getAccess, slackClient2 } from '../utils'
import { createAccess, updateAccess } from '../utils/db'

export const auth = fastify => async (req, rep) => {
    if (req.query.error && req.query.error === 'access_denied') {
        return rep.send('User was denied permissions')
    }

    const sc = slackClient2()

    const body = await sc.oauth.v2.access({
        code: req.query.code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
    })

    if (body.ok) {
        fastify.log.info(`Oauth recieved`)

        let {
            bot_user_id: botUserId,
            team: { id: teamId, name: teamName },
            authed_user: { access_token: userToken }
        }: any = body

        const token = await getAccess(fastify.mongo.db, body['team_id'])
        const newToken = {
            teamName,
            teamId,
            botUserId,
            token: body['access_token'],
            userToken
        }

        if (!token) {
            fastify.log.info(`Team ${teamId} token created`)
            await createAccess(fastify.mongo.db, newToken)
        } else {
            fastify.log.info(`Team ${teamId} token renew`)
            await updateAccess(fastify.mongo.db, teamId, newToken)
        }

        rep.send('Success Scrapy bot was installed in your workspace!')
    } else {
        rep.status(200).send(`Error encountered: \n ${JSON.stringify(body)}`)
    }
}
