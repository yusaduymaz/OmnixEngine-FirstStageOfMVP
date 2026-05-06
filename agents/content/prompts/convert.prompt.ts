/**
 * Content Agent — Convert Skill Prompt
 *
 * Bu dosya dönüştürme görevine özel kullanıcı promptunu oluşturur.
 * buildSystemPrompt() (prompts/system.ts) ile birlikte kullanılır:
 *   system: buildSystemPrompt({ platforms: targetPlatforms, tone })
 *   user:   buildConvertPrompt(sourceLabel, targetPlatformLabels, sourceContent)
 */

/**
 * Dönüştürücü için kullanıcı promptu.
 * Kaynak içeriği hedef platformların SEO ve format kurallarına göre yeniden yazar.
 */
export function buildConvertPrompt(
  sourceLabel: string,
  targetPlatformLabels: string,
  sourceContent: string
): string {
  const contentPreview = sourceContent.slice(0, 4000)

  return `Aşağıdaki ürün içeriğini kaynak platform (${sourceLabel}) formatından alıp,
hedef platform(lar)ın (${targetPlatformLabels}) SEO ve içerik kurallarına uygun şekilde DÖNÜŞTÜR.

<source_content platform="${sourceLabel}">
${contentPreview}
</source_content>

GÖREV:
Her hedef platform için ayrı ayrı:
- Platforma özel karakter limitlerine uygun yeni bir başlık (title) yaz
- Platforma özel format kurallarına (bullet point, uzunluk, ton vb.) uyan açıklama (description) yaz

KURALLAR:
- HTML etiketleri KULLANMA — sadece düz metin ve madde imi (-) kullan
- Orijinal ürünün temel özelliklerini koru, uydurma bilgi ekleme
- Her platform için platform_id değerini AYNEN kullan (örn: "trendyol", "amazon_tr")
- Trendyol: maks 100 karakter başlık, yasaklı kelimeler yok ("en ucuz", "bedava" vb.)
- Amazon TR/US: 5 bullet point formatı açıklamada tercih edilir
- Hepsiburada: teknik özellik odaklı, kurumsal ton
- Shopify/WooCommerce: HTML-free, SEO odaklı blog tarzı açıklama

SADECE JSON döndür, başka açıklama ekleme:
{
  "results": [
    {
      "platform": "<platform_id>",
      "title": "<yeni başlık>",
      "description": "<yeni açıklama>"
    }
  ]
}`
}
