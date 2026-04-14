import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const requireModule = createRequire(import.meta.url)

export const generateInvoicePDF = async (html: string, fileName: string): Promise<string> => {
  const invoicesDir = path.join('/tmp', 'invoices')
  fs.mkdirSync(invoicesDir, { recursive: true })

  const filePath = path.join(invoicesDir, fileName)
  let browser: any

  try {
    // Use createRequire to load puppeteer at runtime - bypasses bundler analysis
    let puppeteer: any
    try {
      puppeteer = requireModule('puppeteer')
    } catch {
      try {
        puppeteer = requireModule('puppeteer-core')
      } catch {
        throw new Error('No puppeteer package found. Install puppeteer-core or puppeteer.')
      }
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    })
  } finally {
    if (browser) await browser.close()
  }

  return filePath
}
