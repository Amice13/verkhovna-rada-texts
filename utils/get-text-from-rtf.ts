import rtfToText from 'rtf2text'
import downloadFile from './download-file.ts'

const getText = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    rtfToText.string(buffer.toString('utf8'), (err: Error | null, text: string) => {
      if (err) {
        reject(err)
        return
      }
      resolve(text)
    })
  })
}

const getTextFromRtf = async (url: string): Promise<string> => {
  console.log(url)
  const buffer = await downloadFile(url)
  const text = await getText(buffer)
  return text
}

export default getTextFromRtf
