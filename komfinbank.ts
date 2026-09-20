import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import downloadHtml from './utils/download-html.ts'
import getTextFromPdf from './utils/get-text-from-pdf.ts'
import getTextFromDocx from './utils/get-text-from-docx.ts'
import getTextFromDoc from './utils/get-text-from-doc.ts'
import getTextFromRtf from './utils/get-text-from-rtf.ts'

const START_URL = 'https://komfinbank.rada.gov.ua'
const TRANSCRIPT_URL = `${START_URL}/news/dijalnist9skl/stenogr9skl`

const NAME = 'Комітет з питань фінансів, податкової та митної політики'
const TARGET_PATH = ['.', 'results', 'komfinbank']

let totalTranscripts = 0
await fs.mkdir(path.join(...TARGET_PATH), { recursive: true })

if (config.inform) console.log('Downloading transcripts of: ' + NAME)

const doc = await downloadHtml(TRANSCRIPT_URL)
if (doc === null) throw Error('Start page is not found')

const htmlPages = doc.querySelectorAll('.pages a')
const pageNumbers = [...htmlPages].map(el => el.textContent).filter(el => /^\d+$/.test(el))
const lastPage = pageNumbers[pageNumbers.length - 1]

if (lastPage === undefined) throw new Error('Pages were not found')
if (config.inform) console.log('Number of pages found: ' + lastPage)

const n = parseInt(lastPage)

const pages = config.debug ? [...Array(n - 1).keys()].slice(0, 1) : [...Array(n - 1).keys()]

for (const page of pages) {
  if (config.inform) console.log(`Page ${String(page + 1)} of ${lastPage} is processed`)
  const doc = await downloadHtml(`${TRANSCRIPT_URL}/page/${String(page + 1)}`)
  if (doc === null) continue

  const htmlPages = doc.querySelectorAll('.news_item a')
  const linksSource = [...htmlPages].map(el => {
    return {
      link: el.getAttribute('href'),
      title: el.textContent?.trim()
        .replace(/ +/g, ' ')
    }
  }).filter(el => el.link !== null)
  if (config.inform) console.log(`${String(linksSource.length)} links were found`)

  const links = config.debug ? linksSource.slice(0, 1) : linksSource

  for (const { link, title } of links) {
    totalTranscripts++
    if (link === null) continue
    const isPDF = /pdf$/.test(link)
    const isDocx = /docx$/.test(link)
    const isDoc = /doc$/.test(link)
    const isRtf = /rtf$/.test(link)
    
    const url = /^\/uploads/.test(link) ? `${START_URL}${link}` : link
    let text = ''
    try {
      if (isPDF) text = await getTextFromPdf(url)
      if (isDocx) text = await getTextFromDocx(url)
      if (isDoc) text = await getTextFromDoc(url)
      if (isRtf) text = await getTextFromRtf(url)
    } catch (err) {
      console.log(err)
    }
    await fs.writeFile(path.join(...TARGET_PATH, title + '.txt'), text)
  }
}

if (config.inform) console.log(`${totalTranscripts} were processed`)
