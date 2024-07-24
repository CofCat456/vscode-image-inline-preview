import {
  shallowRef,
  useActiveEditorDecorations,
  useActiveTextEditor,
  useDocumentText,
  useTextEditorSelections,
  watchEffect,
} from 'reactive-vscode'
import {
  type DecorationOptions,
  DecorationRangeBehavior,
  MarkdownString,
  Range,
  window,
} from 'vscode'
import { REGEX_BASE64, config, editorConfig } from './config'
import { base64ToSvg, toDataUrl } from './utils/svgs'
import { getDataURL } from './loader'

export interface DecorationMatch extends DecorationOptions {
  key: string
}

export function useAnnotations() {
  const InlineIconDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; opacity: 0.6 !important;',
    gutterIconSize: 'contain',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const HideTextDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
  })

  const editor = useActiveTextEditor()
  const selections = useTextEditorSelections(editor)
  const text = useDocumentText(() => editor.value?.document)

  const decorations = shallowRef<DecorationMatch[]>([])

  useActiveEditorDecorations(InlineIconDecoration, decorations)
  useActiveEditorDecorations(HideTextDecoration, () => decorations.value
    .map(({ range }) => range)
    .filter(i => !selections.value.map(({ start }) => start.line).includes(i.start.line)))

  // Calculate decorations
  watchEffect(async () => {
    if (!editor.value)
      return

    if (!config.annotations) {
      decorations.value = []
      return
    }

    const keys: [Range, string][] = []

    const regexBase64 = new RegExp(REGEX_BASE64, 'g')
    const base64Matches = text.value!.matchAll(regexBase64)

    for (const match of base64Matches) {
      const key = match[0]
      if (!key)
        continue

      const startPos = editor.value.document.positionAt(match.index!)
      const endPos = editor.value.document.positionAt(match.index! + match[0].length)
      keys.push([new Range(startPos, endPos), key])
    }

    const fontSize = editorConfig.fontSize
    const position = config.position === 'after' ? 'after' : 'before'

    decorations.value = (await Promise.all(keys.map(async ([range, key]) => {
      const item: DecorationMatch = {
        range,
        renderOptions: {
          [position]: {
            contentIconPath: await getDataURL(key, fontSize),
          },
        },
        hoverMessage: new MarkdownString(`| |\n|:---:|\n| ![](${toDataUrl(base64ToSvg(key, config.hoverSize))})`),
        key,
      }
      return item
    }))).filter(Boolean)
  })
}
