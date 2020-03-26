import * as sourceMapSupport from 'source-map-support'
import start from './server'
import { logger } from './utils'

sourceMapSupport.install()

process.on('uncaughtException', error => {
    logger.error(error)
})
process.on('unhandledRejection', error => {
    logger.error(error)
})

start()
