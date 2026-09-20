import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import downloadHtml from './utils/download-html.ts'
import getTextFromPdf from './utils/get-text-from-pdf.ts'

const START_URL = 'https://kompravpol.rada.gov.ua'
const TRANSCRIPT_URL = `${START_URL}/documents/zasid/stenograma_9skl`

const NAME = 'Комітет з питань правової політики'
const TARGET_PATH = ['.', 'results', 'kompravpol']

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
  const linksSource = [...htmlPages]
    .map(el => el.getAttribute('href'))
    .filter(el => el !== null)

  if (config.inform) console.log(`${String(linksSource.length)} links were found`)

  const links = config.debug ? linksSource.slice(0, 1) : linksSource

  if (config.inform) console.log(`${String(linksSource.length)} links were found`)

  for (const link of links) {
    const doc = await downloadHtml(`${START_URL}${link}`)
    if (doc === null) continue
    const htmlFiles = doc.querySelectorAll('.attachment-list a')
    const filesSource = [...htmlFiles]
      .map(el => {
        return {
          url: el.getAttribute('href'),
          title: el.textContent.trim()
            .replace(': проблематика та перспективи альтернативного вирішення спорів у сучасних умовах', '')
        }
      })
      .filter(el => el.url !== null)
    const files = config.debug ? filesSource.slice(0, 1) : filesSource
    const processed = new Set()
    for (const { url, title } of files) {
      if (processed.has(url)) continue
      processed.add(url)
      totalTranscripts++
      if (url === null) continue
      const isPDF = /pdf$/.test(url)
      if (!isPDF) continue
      const urlPath = `${START_URL}${url}`
      let text = ''
      if (isPDF) text = await getTextFromPdf(urlPath)
      await fs.writeFile(path.join(...TARGET_PATH, title + '.txt'), text)
    }
  }
}

if (config.inform) console.log(`${totalTranscripts} were processed`)
