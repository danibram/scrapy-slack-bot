import { EventEmitter } from 'events'
import actionDeleteAll from './action.deleteAll'
import actionDeleteImage from './action.deleteImage'
import actionDeleteImageFromEvent from './action.deleteImageFromEvent'
import actionDeleteImageFromMenu from './action.deleteImageFromMenu'
import actionDeleteMessage from './action.deleteMessage'
import eventAppUnninstalled from './event.appUnninstalled'
import sharedFileEvent from './event.shareFile'
import slashHelp from './slash.help'
import slashList from './slash.list'

export const asyncSlack = new EventEmitter()

asyncSlack.on('event::file_shared', sharedFileEvent)
asyncSlack.on('event::app_uninstalled', eventAppUnninstalled)
asyncSlack.on('action::delete_all', actionDeleteAll)
asyncSlack.on('action::delete_image_from_event', actionDeleteImageFromEvent)
asyncSlack.on('action::delete_image_from_menu', actionDeleteImageFromMenu)
asyncSlack.on('action::delete_image', actionDeleteImage)
asyncSlack.on('action::delete_message', actionDeleteMessage)
asyncSlack.on('slash::list', slashList)
asyncSlack.on('slash::help', slashHelp)
