import { useCommand } from 'reactive-vscode'
import { config } from './config'
import * as meta from './generated/meta'

export function useCommands() {
  useCommand(meta.commands.toggleAnnotations, () => {
    config.$update('annotations', !config.annotations)
  })
}
