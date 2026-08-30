import puppeteer from 'puppeteer';

export async function renderHtmlToPdfBuffer(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    // Guard against the proposal being rendered/paginated before web fonts finish loading,
    // which previously produced pages with fallback-font text or shifted, clipped layout.
    await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
