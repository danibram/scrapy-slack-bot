import * as crypto from 'crypto'
import { Unauthorized } from 'http-errors'
import * as tsscmp from 'tsscmp'

export const slackMiddleware = async (req, res) => {
    let stringBody: string = (req as any).body.raw
        ? (req as any).body.raw.toString('utf8')
        : JSON.stringify((req as any).body)

    if (req.body.parsed) {
        req.body = req.body.parsed.payload
            ? JSON.parse(req.body.parsed.payload)
            : req.body.parsed
    }

    const {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp
    } = req.headers

    const signingSecret = process.env.SIGNING_SECRET

    //verifyRequestSignature from slack bolt framework

    if (signature === undefined || requestTimestamp === undefined) {
        throw new Unauthorized(
            'Slack request signing verification failed. Some headers are missing.'
        )
    }

    const ts = Number(requestTimestamp)
    if (isNaN(ts)) {
        throw new Unauthorized(
            'Slack request signing verification failed. Timestamp is invalid.'
        )
    }

    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5

    if (ts < fiveMinutesAgo) {
        throw new Unauthorized(
            'Slack request signing verification failed. Timestamp is too old.'
        )
    }

    const hmac = crypto.createHmac('sha256', signingSecret)
    const [version, hash] = signature.split('=')
    hmac.update(`${version}:${ts}:${stringBody}`)

    if (!tsscmp(hash, hmac.digest('hex'))) {
        throw new Unauthorized(
            'Slack request signing verification failed. Signature mismatch.'
        )
    }
}
