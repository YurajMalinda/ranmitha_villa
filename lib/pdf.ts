import fs from 'node:fs'
import path from 'node:path'

// Vercel/Lambda cannot ship full `puppeteer` (~350MB with bundled Chrome) inside the
// 250MB function limit. `@sparticuz/chromium-min` keeps the bundle small by NOT
// embedding the browser: it downloads the ~66MB pack at runtime and caches it in
// /tmp, so only the first cold start pays for the fetch. Locally we use the
// `puppeteer` devDependency, which brings its own browser.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

// Must match the installed @sparticuz/chromium-min version, and must be the x64
// build — Vercel Functions run on x86_64. Overridable so the pack can be moved to
// your own storage without a code change (GitHub is not a CDN).
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ??
  'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar'

type LaunchTarget = {
  puppeteer: any
  options: Record<string, unknown>
}

const getLaunchTarget = async (): Promise<LaunchTarget> => {
  if (isServerless) {
    const [{ default: chromium }, puppeteer] = await Promise.all([
      import('@sparticuz/chromium-min'),
      import('puppeteer-core'),
    ])

    // WebGL/SwiftShader is dead weight for rendering an invoice and costs both
    // memory and extraction time.
    chromium.setGraphicsMode = false

    return {
      puppeteer: puppeteer.default ?? puppeteer,
      options: {
        args: chromium.args,
        // Unlike the full package, -min requires the pack URL explicitly.
        executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
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
