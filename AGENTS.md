# OmniX Engine — AI Omnichannel İçerik & Analiz Motoru

## Proje
Tüm global pazaryerleri ve e-ticaret altyapıları (Trendyol, Hepsiburada, Shopify, WooCommerce, Amazon, Etsy vb.) için Türkçe/çok dilli SEO odaklı AI içerik üreteci, dönüştürücü, analizör ve görsel stüdyosu.
Design ve mimari detaylar için: @c:\Users\duyma\Desktop\contentforge-tr\design.md ve @c:\Users\duyma\Desktop\contentforge-tr\architecture.md

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- Clerk (kullanıcı yönetimi)
- Claude API claude-sonnet-4 modeli
- fal.ai / Replicate (görsel AI)
- Cheerio / Puppeteer Core (web scraping)
- Stripe (ödeme)
- Zustand (state), TanStack Query (data fetching)
- Zod (validasyon), React Hook Form

## Klasör Yapısı
- app/(marketing) → Landing page + Hakkımızda + Hizmetler + İletişim
- app/(auth) → Giriş/kayıt
- app/(dashboard)/app → Ana uygulama
  - /generate → İçerik üreteci
  - /converter → İçerik dönüştürücü
  - /analyzer → İçerik analizörü
  - /image-studio → Görsel stüdyosu
  - /pricing → Fiyat analizi
  - /inventory → Stok yönetimi
- app/api → Backend route'ları
- agents/ → 4 Agent implementasyonu (content, image, pricing, inventory)
- orchestrator/ → Merkezi yönetici (router, executor, context)
- lib/ → Servis istemcileri (anthropic, supabase, redis, langfuse, trigger)
- prompts/ → Sistem prompt dosyaları
- types/ → TypeScript tip tanımları

## Kodlama Kuralları
- Tüm metinler ve yorumlar Türkçe
- Her API route Zod ile validate edilmeli
- Claude çağrıları streaming kullanmalı (Vercel AI SDK)
- Hata mesajları kullanıcıya Türkçe gösterilmeli
- RLS tüm Supabase tablolarında aktif olmalı

## Dokümantasyon
- Tasarım sistemi, kullanıcı akışları, ekranlar: @c:\Users\duyma\Desktop\contentforge-tr\design.md
- Teknik mimari, DB şeması, API tasarımı: @c:\Users\duyma\Desktop\contentforge-tr\architecture.md