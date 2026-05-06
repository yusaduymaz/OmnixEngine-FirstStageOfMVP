import { getSupabaseAdmin } from '@/lib/supabase/server'

/**
 * Sunucu tarafında site_settings okumak için yardımcı.
 * Anahtar bulunamazsa fallback değer döner.
 */
export async function getSiteSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle()
    if (!data) return fallback
    return (data.value as T) ?? fallback
  } catch {
    return fallback
  }
}

export async function getSiteSettings(keys: string[]): Promise<Record<string, unknown>> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('site_settings').select('key, value').in('key', keys)
    const map: Record<string, unknown> = {}
    for (const row of data ?? []) map[row.key as string] = row.value
    return map
  } catch {
    return {}
  }
}
