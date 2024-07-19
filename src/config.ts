import { defineConfigObject } from 'reactive-vscode'
import * as Meta from './generated/meta'

export const config = defineConfigObject<Meta.ScopedConfigKeyTypeMap>(
  Meta.scopedConfigs.scope,
  Meta.scopedConfigs.defaults,
)

export const editorConfig = defineConfigObject(
  'editor',
  {
    fontSize: 12,
  },
)

export const REGEX_BASE64 = /data:image\/(?:jpeg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*/g
