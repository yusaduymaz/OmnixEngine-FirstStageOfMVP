// OmniX Engine — Upstash Redis İstemcisi
// Rate limiting, cache ve job queue yönetimi

import { Redis } from '@upstash/redis'

// ═══════════════════════════════════════════════════════
// İstemci Yapılandırması
// ═══════════════════════════════════════════════════════

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ═══════════════════════════════════════════════════════
// Cache TTL Sabitleri (saniye)
// ═══════════════════════════════════════════════════════

export const CACHE_TTL = {
  CONTENT: 3600,        // 1 saat — içerik üretimleri
  PRICING: 900,         // 15 dakika — fiyat verileri
  INVENTORY: 86400,     // 24 saat — stok tahminleri
  CATEGORIES: 604800,   // 1 hafta — kategori ağacı
} as const

// ═══════════════════════════════════════════════════════
// Cache Key Oluşturucular
// ═══════════════════════════════════════════════════════

export const cacheKeys = {
  agent: (agent: string, skill: string, id: string) =>
    `omnix:${agent}:${skill}:${id}`,
  rateLimit: (userId: string) =>
    `omnix:rate:${userId}`,
  queue: (jobId: string) =>
    `omnix:queue:${jobId}`,
  competitor: (productId: string, platform: string) =>
    `competitor:${productId}:${platform}`,
}

// ═══════════════════════════════════════════════════════
// Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════════════════

/**
 * Cache'den oku — yoksa çalıştır ve kaydet
 */
export async function cachedFetch<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  await redis.set(key, fresh, { ex: ttl })
  return fresh
}

/**
 * Sliding window rate limiter
 */
export async function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = cacheKeys.rateLimit(userId)
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  // Eski kayıtları temizle
  await redis.zremrangebyscore(key, 0, windowStart)

  // Mevcut sayıyı kontrol et
  const count = await redis.zcard(key)

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  // Yeni istek ekle
  await redis.zadd(key, { score: now, member: `${now}` })
  await redis.expire(key, windowSeconds)

  return { allowed: true, remaining: maxRequests - count - 1 }
}

export default redis
