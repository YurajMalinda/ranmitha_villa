import fs from 'node:fs'
import path from 'node:path'

// Vercel/Lambda cannot ship full `puppeteer` (~350MB with bundled Chrome) inside the
// 250MB function limit, so serverless runs `puppeteer-core` against the compressed
// Chromium binary from `@sparticuz/chromium`. Locally we use the `puppeteer` devDependency,
// which brings its own browser.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

type LaunchTarget = {
  puppeteer: any
  options: Record<string, unknown>
}

const getLaunchTarget = async (): Promise<LaunchTarget> => {
  if (isServerless) {
    const [{ default: chromium }, puppeteer] = await Promise.all([
      import('@sparticuz/chromium'),
      import('puppeteer-core'),
    ])

    return {
      puppeteer: puppeteer.default ?? puppeteer,
      options: {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      },
    }
  }

  const puppeteer = await import('puppeteer')

  return {
    puppeteer: puppeteer.default ?? puppeteer,
    options: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  }
}

export const generateInvoicePDF = async (html: string, fileName: string): Promise<string> => {
  const invoicesDir = path.join('/tmp', 'invoices')
  fs.mkdirSync(invoicesDir, { recursive: true })

  const filePath = path.join(invoicesDir, fileName)
  let browser: any

  try {
    const { puppeteer, options } = await getLaunchTarget()
    browser = await puppeteer.launch(options)

    const page = await browser.newPage()

    // `networkidle0` waits on requests the invoice template never makes; `load` is
    // enough for self-contained HTML and avoids burning the function timeout.
    await page.setContent(html, {
      waitUntil: 'load',
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
