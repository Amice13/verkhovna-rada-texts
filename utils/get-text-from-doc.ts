import WordExtractor from 'word-extractor'
import downloadFile from './download-file.ts'

const getTextFromDoc = async (url: string): Promise<string> => {
  const buffer = await downloadFile(url)
  const extractor = new WordExtractor()
  const doc = await extractor.extract(buffer)
  return doc.getBody()
}

export default getTextFromDoc
