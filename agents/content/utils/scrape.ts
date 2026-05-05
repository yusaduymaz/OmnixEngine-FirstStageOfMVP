import * as cheerio from 'cheerio'

export async function scrapeUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      // Bazı siteler timeout atabilir, 10 saniye bekle
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Temel temizlik (script ve style etiketlerini kaldır)
    $('script, style, noscript, iframe, svg, img, video, audio').remove()
    
    const title = $('title').text().trim() || $('h1').first().text().trim()
    const description = $('meta[name="description"]').attr('content')?.trim() || ''
    
    // Main content area
    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)
      
    return { title, description, content }
  } catch (err) {
    console.error('[Scrape] Scraping error:', err)
    throw new Error('URL içeriği alınamadı. Lütfen geçerli ve erişilebilir bir sayfa linki girin.')
  }
}
