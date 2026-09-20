import { processPdf } from '@firecrawl/pdf-inspector'
import downloadFile from './download-file.ts'

const getTextFromPdf = async (url: string): Promise<string> => {
  const buffer = await downloadFile(url)
  const result = processPdf(buffer)
  return result.markdown ?? ''
}

export default getTextFromPdf
