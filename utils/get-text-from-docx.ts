import mammoth from 'mammoth'
import downloadFile from './download-file.ts'

const getTextFromDocx = async (url: string): Promise<string> => {
  const buffer = await downloadFile(url)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export default getTextFromDocx
