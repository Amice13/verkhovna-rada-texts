import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import downloadHtml from './utils/download-html.ts'
import getTextFromPdf from './utils/get-text-from-pdf.ts'
import getTextFromDoc from './utils/get-text-from-doc.ts'

const START_URL = 'https://comeuroint.rada.gov.ua'
const TRANSCRIPT_URL = 'https://comeuroint.rada.gov.ua/news/activity/meeting_activity/meeting_activity_stenographs/72587.html'

const NAME = 'Комітет з питань інтеграції України до Європейського Союзу'
const TARGET_PATH = ['.', 'results', 'comeuroint']

let totalTranscripts = 0
await fs.mkdir(path.join(...TARGET_PATH), { recursive: true })

if (config.inform) console.log('Downloading transcripts of: ' + NAME)

const doc = await downloadHtml(TRANSCRIPT_URL)
if (doc === null) throw Error('Start page is not found')

const htmlPages = doc.querySelectorAll('.item_content a')
const linksSource = [...htmlPages].map(el => {
  return {
    title: el.textContent.trim(),
    href: el.getAttribute('href')
  }
})
const links = config.debug ? linksSource.slice(0, 1) : linksSource

for (const { title, href } of links) {
  totalTranscripts++
  const url = `${START_URL}${href}`
  let text = ''
  try {
    text = await getTextFromPdf(url)
  } catch (err) {
    console.log('Text is not PDF')
    text = await getTextFromDoc(url)
  }
  await fs.writeFile(path.join(...TARGET_PATH, title + '.txt'), text)
}

if (config.inform) console.log(`${totalTranscripts} were processed`)
