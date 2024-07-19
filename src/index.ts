import { defineExtension } from 'reactive-vscode'
import { version } from '../package.json'
import { Log } from './utils'
import { useAnnotations } from './annotation'

const { activate, deactivate } = defineExtension(async () => {
  Log.info(`🈶 Activated, v${version}`)

  useAnnotations()
})

export { activate, deactivate }
