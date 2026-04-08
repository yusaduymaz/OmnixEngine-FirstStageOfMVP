@AGENTS.md
# ContentForge TR — AI İçerik Üreteci

## Proje
Trendyol ve Hepsiburada satıcıları için Türkçe SEO odaklı AI içerik üreteci.
Design ve mimari detaylar için: @design.md ve @architecture.md

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth)
- Clerk (kullanıcı yönetimi)
- Claude API claude-sonnet-4 modeli
- Stripe (ödeme)
- Zustand (state), TanStack Query (data fetching)
- Zod (validasyon), React Hook Form

## Klasör Yapısı
- app/(marketing) → Landing page
- app/(auth) → Giriş/kayıt
- app/(dashboard)/app → Ana uygulama
- app/api → Backend route'ları
- lib/claude → Prompt ve Claude API yardımcıları
- prompts/ → Sistem prompt dosyaları
- types/ → TypeScript tip tanımları

## Kodlama Kuralları
- Tüm metinler ve yorumlar Türkçe
- Her API route Zod ile validate edilmeli
- Claude çağrıları streaming kullanmalı (Vercel AI SDK)
- Hata mesajları kullanıcıya Türkçe gösterilmeli
- RLS tüm Supabase tablolarında aktif olmalı

## Dokümantasyon
- Tasarım sistemi, kullanıcı akışları, ekranlar: @design.md
- Teknik mimari, DB şeması, API tasarımı: @architecture.md