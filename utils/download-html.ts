import config from '../config.ts'
import { parseHTML } from 'linkedom'

const donwloadHtml = async (url: string) => {
  if (config.inform) console.log('Download URL: ' + url)
  const req = await fetch(url)
  if (!req.ok) {
    if (config.inform) console.error(`Failed to download file: ${req.status} ${req.statusText}`)
    return null
  }
  const text = await req.text()
  const { document } = parseHTML(text)
  return document
}

export default donwloadHtml
