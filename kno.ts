import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import downloadHtml from './utils/download-html.ts'
import getTextFromPdf from './utils/get-text-from-pdf.ts'
import getTextFromDoc from './utils/get-text-from-doc.ts'

const START_URL = 'https://kno.rada.gov.ua'
const TRANSCRIPT_URL = `${START_URL}/documents/zasid`

const NAME = 'Комітет з питань освіти, науки та інновацій'
const TARGET_PATH = ['.', 'results', 'kno']

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
  const linksSource = [...htmlPages].map(el => el.getAttribute('href')).filter(el => el !== null)
  if (config.inform) console.log(`${String(linksSource.length)} links were found`)

  const links = config.debug ? linksSource.slice(0, 1) : linksSource

  for (const link of links) {
    totalTranscripts++
    const doc = await downloadHtml(`${START_URL}${link}`)
    if (doc === null) continue
    const docs = doc.querySelectorAll('.attachment-list a')
    let isPDF = true

    let transcripts = [...new Set([...docs])]
      .filter(el => /ст.{0,2}н.{0,5}ма/i.test(el.textContent))
      .filter(el => el.getAttribute('href')?.includes('pdf'))
      .map(el => {
        return {
          t: el.textContent.trim(),
          u: el.getAttribute('href')
        }
      })
    if (transcripts.length === 0) {
      transcripts = [...new Set([...docs])]
        .filter(el => /ст.{0,2}н.{0,5}ма/i.test(el.textContent))
        .filter(el => el.getAttribute('href')?.includes('doc'))
        .map(el => {
          return {
            t: el.textContent.trim(),
            u: el.getAttribute('href')
          }
        })
      isPDF = false
    }
    const title = doc.querySelector('h1')?.textContent
    for (const { t, u } of transcripts) {
      const url = `${START_URL}${u}`
      const text = isPDF ?
        await getTextFromPdf(url) :
        await getTextFromDoc(url)
      const currentTitle = transcripts.length === 1 ? title : `${title} - ${t}`
      await fs.writeFile(path.join(...TARGET_PATH, currentTitle + '.txt'), text)
    }
  }
}

if (config.inform) console.log(`${totalTranscripts} were processed`)
