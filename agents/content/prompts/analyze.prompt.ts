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
- message: Ne durumda olduğunu bir cümleyle açıkla
- suggestion: İyileştirme önerisi (pass ise null olabilir)
- currentValue: Mevcut değer veya ölçüm (opsiyonel, somut bilgi varsa ekle)

KRİTERLER:
1. titleQuality — Başlık uzunluğu, anahtar kelime kullanımı, netlik, platform limitlerine uyum
2. descriptionDepth — Bilgi zenginliği, fayda odaklılık, minimum kelime sayısı gereksinimleri
3. keywordDensity — SEO anahtar kelime yoğunluğu, morfolojik varyant kullanımı, doğal dağılım
4. platformRules — Hedef platformların yasaklı kelimeleri, format gereksinimleri, karakter limitleri
5. legalCompliance — Türkiye Ticaret Bakanlığı gereksinimleri: hayvansal menşeli içerik beyanı (tekstil/ayakkabı), yanıltıcı üstünlük iddiaları ("en ucuz", "kesin çözüm"), CE belgesi zorunluluğu (bebek ürünleri), INCI listesi (kozmetik)

Genel SEO skoru (0–100) — 5 kriterin ağırlıklı ortalaması:
  titleQuality: %20, descriptionDepth: %20, keywordDensity: %20, platformRules: %25, legalCompliance: %15

SADECE JSON döndür, başka açıklama ekleme:
{
  "overallScore": <number>,
  "criteriaScores": {
    "titleQuality":      { "score": <number>, "status": "pass"|"warn"|"fail", "message": "<string>", "suggestion": "<string|null>", "currentValue": "<string|null>" },
    "descriptionDepth":  { "score": <number>, "status": "pass"|"warn"|"fail", "message": "<string>", "suggestion": "<string|null>", "currentValue": "<string|null>" },
    "keywordDensity":    { "score": <number>, "status": "pass"|"warn"|"fail", "message": "<string>", "suggestion": "<string|null>" },
    "platformRules":     { "score": <number>, "status": "pass"|"warn"|"fail", "message": "<string>", "suggestion": "<string|null>" },
    "legalCompliance":   { "score": <number>, "status": "pass"|"warn"|"fail", "message": "<string>", "suggestion": "<string|null>" }
  }
}`
}
