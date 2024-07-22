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
  Uri,
  window,
} from 'vscode'
import { REGEX_BASE64, config, editorConfig } from './config'
import { base64ToSvg, toDataUrl } from './utils/svgs'

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

    let match
    const regex = REGEX_BASE64
    regex.lastIndex = 0
    const keys: [Range, string][] = []

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text.value!))) {
      const key = match[0]
      if (!key)
        continue

      const startPos = editor.value.document.positionAt(match.index)
      const endPos = editor.value.document.positionAt(match.index + match[0].length)
      keys.push([new Range(startPos, endPos), key])
    }

    const fontSize = editorConfig.fontSize
    const position = config.position === 'after' ? 'after' : 'before'

    decorations.value = (await Promise.all(keys.map(async ([range, key]) => {
      const item: DecorationMatch = {
        range,
        renderOptions: {
          [position]: {
            contentIconPath: Uri.parse(toDataUrl(base64ToSvg(key, fontSize))),
          },
        },
        hoverMessage: new MarkdownString(`| |\n|:---:|\n| ![](${toDataUrl(base64ToSvg(key, 100))})`),
        key,
      }
      return item
    }))).filter(Boolean)
  })
}
