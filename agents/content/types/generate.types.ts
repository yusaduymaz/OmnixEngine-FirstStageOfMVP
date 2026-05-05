/**
 * Content Agent — Generate Skill Tip Tanımları
 *
 * route.ts ile generate.skill.ts arasındaki kontrat.
 * Her iki taraf da bu tipleri kullanarak birbiriyle iletişim kurar.
 */

import type { PlatformId, Tone } from '@/prompts/system'

// ═══════════════════════════════════════════════════════════════════
// Skill Girdi Parametreleri
// ═══════════════════════════════════════════════════════════════════

/** route.ts'den generate skill'ine aktarılan doğrulanmış parametreler */
export interface GenerateSkillInput {
  /** Clerk userId — kimlik doğrulaması route.ts tarafında yapılmış olmalı */
  userId: string
  /** Ürün adı (Zod ile doğrulanmış, min:2 max:500) */
  productName: string
  /** Ürün kategorisi (opsiyonel) */
  category?: string
  /** Çıktı dili */
  language?: 'tr' | 'en'
  /** Hedef pazar ülke kodu */
  country?: 'TR' | 'US' | 'UK' | 'DE' | 'FR' | 'IT' | 'ES'
  /** Hedef platformlar (doğrulanmış PlatformId listesi) */
  platforms: PlatformId[]
  /** Yazı tonu */
  tone: Tone
  /** Ekstra anahtar kelimeler (virgülle ayrılmış) */
  extraKeywords?: string
}

// ═══════════════════════════════════════════════════════════════════
// Supabase Kullanıcı Satırı (Kısmi — skill'in ihtiyaç duyduğu alanlar)
// ═══════════════════════════════════════════════════════════════════

export interface SupabaseUserRow {
  id: string
  credits_used: number
  credits_limit: number
  plan: string
}

// ═══════════════════════════════════════════════════════════════════
// AI Çıktı Parse Sonucu
// ═══════════════════════════════════════════════════════════════════

/** AI'dan dönen ham metinden çıkarılan başlık verisi */
export interface ParsedTitle {
  text: string
  platform: string
  char_count?: number
}

/** extractFirstJSON fonksiyonunun dönüş tipi */
export type ExtractedJSON = Record<string, unknown> | null
