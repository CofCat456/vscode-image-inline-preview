import { Uri } from 'vscode'
import { base64ToSvg, toDataUrl } from './utils/svgs'

export async function getDataURL(key: string, fontSize: number): Promise<Uri> {
  return Uri.parse(toDataUrl(base64ToSvg(key, fontSize)))
}
