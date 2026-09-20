import config from '../config.ts'

const downloadFile = async (url: string) => {
  if (config.inform) console.log('Download URL: ' + url)
  const req = await fetch(url)
  if (!req.ok) {
    if (config.inform) console.error(`Failed to download file: ${req.status} ${req.statusText}`)
    return null
  }
  const arrayBuffer = await req.arrayBuffer()
  const pdf = Buffer.from(arrayBuffer)
  return pdf
}

export default downloadFile
