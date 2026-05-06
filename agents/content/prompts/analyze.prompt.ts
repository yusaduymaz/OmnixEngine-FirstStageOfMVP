/**
 * Content Agent — Analyze Skill Prompt
 *
 * Bu dosya analiz görevine özel kullanıcı promptunu oluşturur.
 * buildSystemPrompt() (prompts/system.ts) ile birlikte kullanılır:
 *   system: buildSystemPrompt({ platforms, tone: 'professional' })
 *   user:   buildAnalyzePrompt(platforms, scrapedData)
 */

export interface ScrapedData {
  title: string
  description: string
  content: string
}

/**
 * Analizör için kullanıcı promptu.
 * 5 kriter — Ticaret Bakanlığı yasal uyumluluk kriteri dahil.
 */
export function buildAnalyzePrompt(
  platforms: string[],
  scrapedData: ScrapedData
): string {
  const platformList = platforms.join(', ')
  const contentPreview = scrapedData.content.slice(0, 3000)

  return `Aşağıda verilen e-ticaret ürün sayfası içeriğini analiz et.
Hedef platform(lar): ${platformList}

<product_page>
  <title>${scrapedData.title}</title>
  <meta_description>${scrapedData.description}</meta_description>
  <page_content>${contentPreview}</page_content>
</product_page>

Bu içeriği aşağıdaki 5 kritere göre değerlendir. Her kriter için:
- score (0–100)
- status: "pass" (≥71) | "warn" (41–70) | "fail" (≤40)
- feedback: Kriterin neden bu puanı aldığını ve spesifik olarak neyin eksik olduğunu açıklayan detaylı Türkçe cümle.

KRİTERLER:
1. titleQuality — Başlık uzunluğu, anahtar kelime kullanımı, netlik, platform limitlerine uyum
2. descriptionDepth — Bilgi zenginliği, fayda odaklılık, minimum kelime sayısı gereksinimleri
3. keywordDensity — SEO anahtar kelime yoğunluğu, morfolojik varyant kullanımı, doğal dağılım
4. platformRules — Hedef platformların yasaklı kelimeleri, format gereksinimleri, karakter limitleri
5. legalCompliance — Türkiye Ticaret Bakanlığı gereksinimleri (tekstil beyanı, yanıltıcı iddialar, CE/INCI zorunlulukları)

Ayrıca, tüm analizi özetleyen en az 3 adet somut iyileştirme önerisi (suggestions) üret.

SADECE JSON döndür, başka açıklama ekleme:
{
  "overallScore": <number>,
  "criteriaScores": {
    "titleQuality":      { "score": <number>, "status": "pass"|"warn"|"fail", "feedback": "<string>" },
    "descriptionDepth":  { "score": <number>, "status": "pass"|"warn"|"fail", "feedback": "<string>" },
    "keywordDensity":    { "score": <number>, "status": "pass"|"warn"|"fail", "feedback": "<string>" },
    "platformRules":     { "score": <number>, "status": "pass"|"warn"|"fail", "feedback": "<string>" },
    "legalCompliance":   { "score": <number>, "status": "pass"|"warn"|"fail", "feedback": "<string>" }
  },
  "suggestions": [
    { "title": "<string>", "description": "<string>", "priority": "high"|"medium"|"low" }
  ]
}`
}
