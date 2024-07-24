import { Buffer } from 'node:buffer'
import Base64 from './base64'

export function urlToSvg(url: string, size: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
      <image width="100%" height="100%" xlink:href="${url}"/>
    </svg>`
}

export function toDataUrl(str: string) {
  return `data:image/svg+xml;base64,${Base64.encode(str)}`
}

/**
 * Parses the size of a base64 image.
 */
function parseBase64ImageSize(base64Image: string): { width: number, height: number } {
  // Ensure we have a complete base64 string
  const base64 = base64Image.split(',')[1] || base64Image

  // Decode the first 24 bytes of the base64 data
  const buffer = Buffer.from(base64, 'base64').slice(0, 24)

  // Check the image type and parse the dimensions
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    // JPEG
    let i = 4
    while (i < buffer.length) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xC0) {
        return {
          height: buffer.readUInt16BE(i + 5),
          width: buffer.readUInt16BE(i + 7),
        }
      }
      i++
    }
  }
  else if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
    // PNG
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    }
  }

  throw new Error('Unsupported image format or unable to parse dimensions')
}

export function base64ToSvg(base64Image: string, size: number, isWidth: boolean = true): string {
  const imageUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/png;base64,${base64Image}`

  try {
    const originalSize = parseBase64ImageSize(base64Image)

    let width: number, height: number
    if (isWidth) {
      width = size
      height = Math.round(size * (originalSize.height / originalSize.width))
    }
    else {
      height = size
      width = Math.round(size * (originalSize.width / originalSize.height))
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 ${originalSize.width} ${originalSize.height}">
      <image width="100%" height="100%" xlink:href="${imageUrl}"/>
    </svg>`
  }
  catch {
    return urlToSvg(imageUrl, size)
  }
}
