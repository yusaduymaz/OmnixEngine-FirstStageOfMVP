# OmniX Engine — Stratejik Yol Haritası (Next Sprints)

Bu doküman, OmniX Engine MVP sonrası 2. aşama geliştirme planını ve senior mühendislik hedeflerini içerir.

## 🎯 Sprint 7: Ölçeklenebilirlik & Bulk Operasyonlar
**Odak:** Bireysel araçlardan "Toplu İşleme" (Bulk) motoruna geçiş.

- [ ] **Trigger.dev Entegrasyonu:** Uzun süren (long-running) işlemler için kuyruk sistemi.
- [ ] **Toplu İçerik Üretimi:** 100+ ürünlük CSV/Excel dosyalarını işleyebilecek background job yapısı.
- [ ] **Toplu Görsel İşleme:** Image Studio yeteneklerinin (bg-remove, studio-render) kuyruğa alınması.
- [ ] **Export Engine:** Sonuçların Trendyol/Shopify uyumlu formatlarda (XLSX, CSV) dışa aktarılması.
- [ ] **Reliability:** AI sağlayıcıları için exponential backoff (yeniden deneme) mekanizması.

## 🔌 Sprint 8: "Push to Store" — Canlı Entegrasyonlar
**Odak:** OmniX'i pazar yerlerine doğrudan bağlamak.

- [ ] **Shopify & WooCommerce App:** API üzerinden ürün oluşturma ve güncelleme yeteneği.
- [ ] **Trendyol Partner Entegrasyonu:** Mağazadaki ürünleri çekme ve güncellenmiş içerikleri/görselleri geri basma.
- [ ] **Webhook Listener:** Mağazada yeni ürün açıldığında otomatik "Draft Content" tetikleme.
- [ ] **Auto-Pilot Modu:** Belirli kriterlere uyan ürünler için AI içeriklerinin otomatik onaylanması ve yayına alınması.

## 🧠 Sprint 9: Stratejik Orchestrator & Otonom Karar
**Odak:** Agent'lar arası veri paylaşımı ve proaktif öneriler.

- [ ] **Multi-Agent Workflow:** "Full Audit" raporunun Pricing + Content + Inventory verilerini birleştirerek tek bir strateji üretmesi.
- [ ] **Dynamic Pricing Automation:** Fiyat önerilerinin API üzerinden otomatik uygulanması.
- [ ] **Stok Odaklı İçerik:** Stok durumu kritik olan ürünler için Content Agent'ın otomatik kampanya metni üretmesi.
- [ ] **Agent Konuşması:** Pricing Agent'ın maliyet artışını algılayıp Content Agent'a "Premium Vurgusu" yapması gerektiğini söylemesi.

## 💎 Engineering Excellence (Sürekli Hedefler)

### ⚡ Performans & Maliyet
- **Prompt Caching:** Anthropic Cache ile %90 maliyet tasarrufu ve düşük latency.
- **Edge Functions:** Orchestrator logic'inin Vercel Edge'e taşınması.
- **Image Optimization:** İşlenen görsellerin WebP formatında ve boyut-optimize şekilde sunulması.

### 🛡️ Güvenlik & İzlenebilirlik
- **Langfuse Deep Dive:** Prompt versioning ve A/B test takibi.
- **Atomic Credits:** RPC fonksiyonları ile race-condition korumalı kredi yönetimi.
- **Unit Testing:** Tüm Agent yetenekleri için %80+ test coverage.

### 🌍 Globalleşme
- **Localization Agent:** İçerikleri sadece çevirmekle kalmayıp, hedef pazarın (örn: Amazon US vs Trendyol TR) kültürel tonuna göre yerelleştirme.
- **Multi-Currency Support:** Global pazar yerleri için otomatik kur dönüşümü ve bölge bazlı fiyat analizi.

---
*Son Güncelleme: 8 Mayıs 2026*
