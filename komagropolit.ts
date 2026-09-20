import fs from 'fs/promises'
import path from 'path'
import config from './config.ts'
import downloadHtml from './utils/download-html.ts'
import getTextFromHtml from './utils/get-text-from-html.ts'

const NAME = 'Комітет з питань аграрної та земельної політики'
const START_URL = 'https://komagropolit.rada.gov.ua/news/zasidKomit/stenogr_zk'
const TARGET_PATH = ['.', 'results', 'komagropolit']

let totalTranscripts = 0
await fs.mkdir(path.join(...TARGET_PATH), { recursive: true })

if (config.inform) console.log('Downloading transcripts of: ' + NAME)

const doc = await downloadHtml(START_URL)
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
  const doc = await downloadHtml(`${START_URL}/page/${String(page + 1)}`)
  if (doc === null) continue

  const htmlPages = doc.querySelectorAll('.news_item a')
  const linksSource = [...htmlPages].map(el => el.getAttribute('href')).filter(el => el !== null)
  if (config.inform) console.log(`${String(linksSource.length)} links were found`)
  let links = config.debug ? linksSource.slice(0, 1) : linksSource
  links = [...new Set(links)]

  for (const link of links) {
    totalTranscripts++
    const doc = await downloadHtml(`${START_URL}${link}`)
    if (doc === null) continue
    const htmlText = doc.querySelector('.item_content')?.innerHTML ?? ''
    const title = doc.querySelector('h2')?.textContent?.trim()
    if (htmlText === null) continue
    const text = getTextFromHtml(htmlText)
    await fs.writeFile(path.join(...TARGET_PATH, title + '.txt'), text)
  }
}

if (config.inform) console.log(`${totalTranscripts} were processed`)
