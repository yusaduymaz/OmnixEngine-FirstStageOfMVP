# OmniX Engine — Abonelik Planları ve Sınırlamalar

## Genel Bakış

OmniX Engine, bir **mikro-kredi (micro-credit)** sistemi ile 5 farklı abonelik planı sunmaktadır. Her işlem (içerik üretimi, analiz, dönüştürme, görsel işleme) belirli miktarda kredi tüketir. Kullanıcılar kredi limitine ulaştıklarında yeni işlem başlatamamaktadırlar.

---

## Mikro-Kredi Sistemi

### Dönüştürme Oranı
- **1 USD = 200 mikro-kredi**
- **Margin Çarpanı = 4x** (altyapı, destek, kâr marjı)

### Örnek Hesaplamalar

#### Claude API Çağrısı (Sonnet)
- Input: 1M token = 1 USD
- Output: 1M token = 5 USD  
- Toplam AI maliyeti: 6 USD
- Mikro-krediye çevrilmesi: 6 × 200 × 4 = 4.800 mikro-kredi

**Sonuç:** Tipik bir içerik üretimi işlemi ~4.000–6.000 mikro-kredi tüketir. 

#### Görsel İşleme (fal.ai background removal)
- Sabit maliyet: ~0.5 USD
- Mikro-kredi: 0.5 × 200 × 4 = 400 mikro-kredi
- Plan kategorisinde: **3 mikro-kredi** (basitleştirilmiş)

#### URL Kazıması (Scraping)
- Sabit maliyet: ~0.05 USD
- Mikro-kredi: 0.05 × 200 × 4 = 40 mikro-kredi
- Plan kategorisinde: **1 mikro-kredi** (basitleştirilmiş)

---

## 5 Abonelik Planı

### 1. Deneme (Trial) — Ücretsiz

| Özellik | Değer |
|---------|-------|
| **Mikro-Kredi** | 250.000 |
| **~İçerik Üretimi/ay** | 50 |
| **Fiyat** | Ücretsiz |
| **Süresi** | 14 gün |
| **Kredi Yenilenmesi** | Bir kerelik |

**Kısıtlamalar:**
- ❌ Toplu Yükleme (Bulk)
- ❌ API Erişimi
- ❌ Workspace oluşturma
- ❌ Görsel Stüdyosu
- ❌ Fiyat Analizi Agent
- ❌ Envanter Yönetimi Agent
- ❌ Team/Davet sistemi

**Aktif Özellikler:**
- ✅ İçerik Üretimi (Generate)
- ✅ İçerik Analizi (Analyzer)
- ✅ İçerik Dönüştürme (Converter)

**Rate Limit:** 2 istek/dakika

---

### 2. Başlangıç (Starter) — ₺299/ay

| Özellik | Değer |
|---------|-------|
| **Mikro-Kredi** | 2.500.000 |
| **~İçerik Üretimi/ay** | 500 |
| **Fiyat** | ₺299/ay |
| **Kredi Yenilenmesi** | Aylık otomatik |

**Yeni Özellikler (Trial'a ek):**
- ✅ Görsel Stüdyosu
- ✅ 1 Workspace

**Halen Kısıtlanmış:**
- ❌ Toplu Yükleme
- ❌ API Erişimi
- ❌ Fiyat/Envanter Agentleri
- ❌ Team sistemi

**Rate Limit:** 5 istek/dakika

---

### 3. Büyüme (Growth) — ₺799/ay ⭐ Önerilen

| Özellik | Değer |
|---------|-------|
| **Mikro-Kredi** | 10.000.000 |
| **~İçerik Üretimi/ay** | 2.000 |
| **Fiyat** | ₺799/ay |
| **Kredi Yenilenmesi** | Aylık otomatik |

**Yeni Özellikler (Starter'a ek):**
- ✅ Toplu Yükleme (Bulk)
- ✅ API Erişimi
- ✅ Fiyat Analizi Agent
- ✅ Envanter Yönetimi Agent
- ✅ 3 Workspace

**Halen Kısıtlanmış:**
- ❌ Team/Davet sistemi
- ❌ SLA desteği

**Rate Limit:** 10 istek/dakika

---

### 4. Acentalık (Agency) — ₺2.499/ay

| Özellik | Değer |
|---------|-------|
| **Mikro-Kredi** | 50.000.000 |
| **~İçerik Üretimi/ay** | 10.000 |
| **Fiyat** | ₺2.499/ay |
| **Kredi Yenilenmesi** | Aylık otomatik |

**Yeni Özellikler (Growth'a ek):**
- ✅ 10 Workspace
- ✅ Gelişmiş API erişimi
- ✅ Opsiyonel: Özel webhook entegrasyonu

**Halen Kısıtlanmış:**
- ❌ Team/Davet sistemi
- ❌ SLA desteği
- ❌ Özel model fine-tuning

**Rate Limit:** 20 istek/dakika

---

### 5. Kuruluş (Enterprise) — Özel Fiyatlandırma

| Özellik | Değer |
|---------|-------|
| **Mikro-Kredi** | 500.000.000 |
| **~İçelik Üretimi/ay** | 100.000+ |
| **Fiyat** | Müzakere bazlı |
| **Kredi Yenilenmesi** | Kontrat bazlı |

**Tüm Özellikler Açık:**
- ✅ Sınırsız Workspace
- ✅ Team/Davet sistemi (e-posta ve rol bazlı)
- ✅ SLA desteği (uptime garantisi)
- ✅ Dedikeli teknik destek
- ✅ Özel webhook entegrasyonu
- ✅ Model fine-tuning (opsiyonel)
- ✅ Kişiselleştirilmiş feature set

**Rate Limit:** 50 istek/dakika (veya özel)

**İletişim:** sales@omnixengine.com

---

## Feature Erişim Matrisi

| Özellik | Trial | Starter | Growth | Agency | Enterprise |
|---------|-------|---------|--------|--------|------------|
| **İçerik Üretimi** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **İçerik Analizi** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **İçerik Dönüştürme** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Görsel Stüdyosu** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Fiyat Analizi Agent** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Envanter Yönetimi Agent** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Toplu Yükleme (Bulk)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **API Erişimi** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Workspace Oluşturma** | 0 | 1 | 3 | 10 | ∞ |
| **Team / Davet Sistemi** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **SLA Desteği** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Dedikeli Destek** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## API Rate Limiting (Dakika Başı)

| Plan | Maks İstek | Pencere |
|------|-----------|--------|
| Trial | 2 | 60 saniye |
| Starter | 5 | 60 saniye |
| Growth | 10 | 60 saniye |
| Agency | 20 | 60 saniye |
| Enterprise | 50 | 60 saniye |

**Implementasyon:** Redis sliding window algoritması (`lib/redis.ts`). Limit aşıldığında 429 HTTP status döner ve `Retry-After: 60` header'ı gönderilir.

---

## Teknik Implementasyon

### Kredi Kontrolü

Her işlem başlangıcında (`generate.skill.ts`, `analyze.skill.ts`, `convert.skill.ts`):

```typescript
if (user.credits_limit - user.credits_used <= 0) {
  throw new GenerateSkillError('Krediniz tükendi.', 403)
}
```

### Kredi Dükümü — Atomik RPC

Generate ve Analyze işlemlerinde mikro-kredi otomatik hesaplanarak atomik olarak düşülür:

```typescript
const aiCredits = tokensToCredits('claude-sonnet-4', inputTokens, outputTokens)
await supabase.rpc('increment_credits', { user_uuid: user.id, amount: aiCredits })

// Audit log
await supabase.from('credit_transactions').insert({
  user_id: user.id,
  amount: -aiCredits,
  type: 'usage',
  module: 'generate',
  tokens_input: inputTokens,
  tokens_output: outputTokens,
  model: 'claude-sonnet-4',
  cost_usd: tokensToUsd('claude-sonnet-4', inputTokens, outputTokens),
})
```

### Feature Gate

`requireFeature()` fonksiyonu Plan kontrol eder:

```typescript
export async function requireFeature(
  clerkUserId: string,
  feature: FeatureKey,
): Promise<void> {
  const plan = await getUserPlan(clerkUserId, 'clerk')
  if (!hasFeature(plan, feature)) {
    throw new ApiError(403, 'FEATURE_LOCKED', `Bu özellik ${feature} planınızda yok.`)
  }
}
```

Uygulamalar:
- `/api/pricing` → `await requireFeature(userId, 'pricingAgent')`
- `/api/inventory` → `await requireFeature(userId, 'inventoryAgent')`
- `/api/workspaces/[id]/invite` → `await requireFeature(userId, 'teams')`

### Rate Limiting

```typescript
const plan = await getUserPlan(userId)
const { allowed } = await checkRateLimit(userId, RATE_LIMITS[plan].maxRequests, 60)
if (!allowed) {
  return Response.json(
    { hata: 'Çok fazla istek.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  )
}
```

---

## Plan Yükseltme İş Akışı

1. **Kullanıcı Sidebar'da "Plan Yükselt" butonuna tıklar** → `/app/settings/billing`
2. **Abonelik sekmesinde paket kartları görüntülenir** → `PricingModal` bileşeni
3. **Checkout'u tıkla** → `/api/billing/checkout` → Stripe session oluşturur
4. **Stripe'da ödeme yap** → `POST /api/webhooks/stripe` webhook tetiklenir
5. **Webhook:** `checkout.session.completed` olayında
   - `users.plan` → yeni plan olarak güncellenir
   - `users.credits_limit` → yeni kredi limitine ayarlanır (300K Starter → 2.5M Growth)
   - `users.credits_used` → sıfırlanır
   - `credit_transactions` → kaydı eklenir (type: 'subscription')

---

## Upgrade Senaryoları

### Trial → Starter
- **Kredi Değişimi:** 50K (kalan) → 2.5M (yeni)
- **Yeni Özellikler:** Görsel Stüdyosu, 1 Workspace
- **Rate Limit:** 2/dk → 5/dk

### Starter → Growth
- **Kredi Değişimi:** 2.5M (kalan) → 10M (yeni)
- **Yeni Özellikler:** Fiyat/Envanter Agentleri, Toplu Yükleme, API, 3 Workspace
- **Rate Limit:** 5/dk → 10/dk

### Growth → Agency
- **Kredi Değişimi:** 10M (kalan) → 50M (yeni)
- **Yeni Özellikler:** 10 Workspace, webhook entegrasyonu opsiyonu
- **Rate Limit:** 10/dk → 20/dk

---

## Faturalama ve Stripeveri Entegrasyonu

### Stripe Price IDs

```typescript
// lib/stripe/plans.ts
const PLANS = {
  trial: { priceId: null, /* free */ },
  starter: { priceId: 'price_1QxABC123...' },   // ₺299/ay
  growth: { priceId: 'price_1QxDEF456...' },    // ₺799/ay
  agency: { priceId: 'price_1QxGHI789...' },    // ₺2.499/ay
  enterprise: { priceId: null, /* custom */ },
}
```

### Webhook İşleme (`app/api/webhooks/stripe/route.ts`)

| Event | İşlem |
|-------|-------|
| `checkout.session.completed` | Plan yükseltme |
| `customer.subscription.updated` | Plan değişikliği (downgrade da dahil) |
| `customer.subscription.deleted` | Plan → Trial (iptal/iptal etme) |
| `invoice.payment_failed` | Ödeme başarısız (e-posta bildirimi) |

---

## Teknik Detaylar

### Dosyalar

| Dosya | Sorumluluk |
|-------|-----------|
| `lib/stripe/plans.ts` | Plan tanımları, fiyatlar, özellikler |
| `lib/billing/feature-gates.ts` | `requireFeature()`, RATE_LIMITS sabiti |
| `lib/billing/credit-cost.ts` | Mikro-kredi hesaplamalarıTokens to Credits) |
| `lib/redis.ts` | `checkRateLimit()` Redis sliding window |
| `app/api/webhooks/stripe/route.ts` | Stripe event handler |
| `app/api/generate/route.ts`, `/analyze`, `/convert` | Rate limiting ve feature gates |
| `app/(dashboard)/app/layout.tsx` | Sidebar upgrade CTA |
| `types/global.ts` | PlanId, PlanFeatures type'ları |

### Database

```sql
-- users tablosu
- plan: VARCHAR(50) — 'trial' | 'starter' | 'growth' | 'agency' | 'enterprise'
- credits_limit: INTEGER — Aylık mikro-kredi balı
- credits_used: INTEGER — Tüketilen mikro-kredi
- stripe_customer_id: VARCHAR(255) — Stripe müşteri ID'si

-- credit_transactions tablosu (audit log)
- user_id: UUID
- amount: INTEGER — Negatif = kullanım, pozitif = ekleme
- type: VARCHAR(50) — 'usage' | 'subscription' | 'purchase' | 'refund'
- module: VARCHAR(50) — 'generate' | 'analyze' | 'convert' | 'image'
- tokens_input, tokens_output: INTEGER
- model: VARCHAR(100)
- cost_usd: DECIMAL
```

---

## Bakım ve Monitoring

### Günlük Kontroller
- `/api/billing` cevap süresi (< 500ms)
- Stripe webhook ping'leri (test event'leri)
- Rate limit false positives (Redis availability)

### Aylık İncelemeler
- Plan dağılımı (kaç kullanıcı hangi planda)
- Ortalama aylık kredi tüketimi
- Toplam API istekleri ve rate limit aşımları
- Stripe dispute oranı

### Langfuse Integration

Her işlemin token kullanımı ve maliyet:

```typescript
// Langfuse event
{
  name: 'content-generation',
  userId: user.id,
  metadata: {
    plan: user.plan,
    credits_used: aiCredits,
    model: 'claude-sonnet-4',
    tokens: tokensUsed,
  }
}
```

---

## İletişim

- **Faturalama Soruları:** billing@omnixengine.com
- **Teknik Destek:** support@omnixengine.com (Growth+) veya `/help` komutu
- **Enterprise:** sales@omnixengine.com

---

**Son Güncelleme:** Mayıs 2026
