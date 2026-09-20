import { convert } from 'html-to-text'

const getTextFromHtml = (html: string): string => {
  const text = convert(html, { wordwrap: null })
  return text
}

export default getTextFromHtml
