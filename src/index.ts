import { defineExtension } from 'reactive-vscode'
import { version } from '../package.json'
import { Log } from './utils'
import { useAnnotations } from './annotation'
import { useCommands } from './commands'

const { activate, deactivate } = defineExtension(async () => {
  Log.info(`🈶 Activated, v${version}`)

  useCommands()
  useAnnotations()
})

export { activate, deactivate }
