import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Omnix Engine',
}

// ── Tip Tanımları ────────────────────────────────────────────────────────────

interface RecentGen {
  id: string
  product_name: string
  created_at: string
  status: string
}

// ── Yardımcı: Tarih formatlama ───────────────────────────────────────────────

function relativeDate(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
  if (diff < 172800) return 'Dün'
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── İkonlar ──────────────────────────────────────────────────────────────────

const IconHistory = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconTrending = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const IconDots = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 12a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
)
const IconRocket = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
)
const IconChevron = () => (
  <svg className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

// ── Ana Sayfa Component ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const firstName = clerkUser.firstName ?? clerkUser.username ?? 'Kullanıcı'
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || firstName
  const avatarUrl = clerkUser.imageUrl

  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, plan, credits_used, credits_limit')
    .eq('clerk_id', clerkUser.id)
    .single()

  let totalGenerations = 0
  let avgSeoScore: number | null = null
  let recentGenerations: RecentGen[] = []

  if (user?.id) {
    const { count } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    totalGenerations = count ?? 0

    const { data: seoData } = await supabase
      .from('generations')
      .select('seo_score')
      .eq('user_id', user.id)
      .not('seo_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30)

    if (seoData && seoData.length > 0) {
      const sum = seoData.reduce((acc: number, r: { seo_score: number }) => acc + r.seo_score, 0)
      avgSeoScore = Math.round(sum / seoData.length)
    }

    const { data: genData } = await supabase
      .from('generations')
      .select('id, product_name, created_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    recentGenerations = (genData ?? []) as RecentGen[]
  }

  const creditsUsed = user?.credits_used ?? 0
  const creditsLimit = user?.credits_limit ?? 50
  const creditsRemaining = creditsLimit - creditsUsed
  const creditPct = Math.min(Math.round((creditsUsed / creditsLimit) * 100), 100)

  return (
    <div className="p-8">
      {/* Üst Bar */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Hoş geldin, {firstName} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-sm">İçerik stratejin bugün mükemmel görünüyor. İşte genel bakış:</p>
        </div>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={fullName} className="w-10 h-10 rounded-full border-2 border-orange-100" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{fullName}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.plan ?? 'trial'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ── SOL: Özet + Aksiyonlar ──────────────────────────────────────── */}
        <div className="col-span-8 space-y-8">

          {/* 3'lü İstatistik Kartları */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-orange-50 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Toplam Üretilen</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {totalGenerations}
                </span>
                {totalGenerations > 0 && (
                  <span className="text-sm font-bold text-green-600 mb-1 flex items-center gap-0.5">
                    <IconTrending />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Toplam içerik üretimi</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-orange-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kalan Kredi</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-orange-600" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {creditsRemaining}
                </span>
                <span className="text-xl font-bold text-slate-300">/ {creditsLimit}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${creditPct}%` }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-orange-50 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ortalama SEO Skoru</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {avgSeoScore ?? '—'}
                </span>
                {avgSeoScore !== null && <span className="text-lg font-bold text-slate-400 mb-1">/100</span>}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Son 30 içerik ortalaması</p>
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="grid grid-cols-2 gap-6">
            <Link
              href="/app/generate"
              className="col-span-1 p-8 rounded-2xl text-white flex flex-col justify-between group cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #ff6000 0%, #a63c00 100%)' }}
            >
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Yeni İçerik Üret</h3>
                <p className="text-orange-100/80 text-sm">AI ile saniyeler içinde SEO uyumlu ürün açıklamaları oluşturun.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm">
                Hemen Başla
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            <div className="col-span-1 space-y-6">
              <Link href="/app/library" className="bg-slate-100 p-6 rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm">
                    <IconHistory />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Geçmişi İncele</h4>
                    <p className="text-xs text-slate-500">Önceki üretimlerinizi yönetin.</p>
                  </div>
                </div>
                <IconChevron />
              </Link>

              <div className="bg-slate-100 p-6 rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Trendyol Analizi</h4>
                    <p className="text-xs text-slate-500">Pazar yeri verilerini optimize edin.</p>
                  </div>
                </div>
                <IconChevron />
              </div>
            </div>
          </div>

          {/* Son Üretimler */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Son Üretimler</h3>
              <Link href="/app/library" className="text-sm font-semibold text-orange-600 hover:underline">Tümünü Gör</Link>
            </div>

            {recentGenerations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Henüz üretim yapılmadı.{' '}
                <Link href="/app/generate" className="text-orange-600 hover:underline font-semibold">İlk içeriği üret →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 px-4">Ürün Adı</th>
                      <th className="pb-4 px-4">Tarih</th>
                      <th className="pb-4 px-4">Durum</th>
                      <th className="pb-4 px-4 text-right">Eylem</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentGenerations.map((gen) => (
                      <tr key={gen.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-800 max-w-[200px] truncate">{gen.product_name}</td>
                        <td className="py-4 px-4 text-slate-500 italic">{relativeDate(gen.created_at)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${gen.status === 'completed' ? 'bg-green-50 text-green-700'
                            : gen.status === 'failed' ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                            }`}>
                            {gen.status === 'completed' ? 'Tamamlandı' : gen.status === 'failed' ? 'Başarısız' : 'Bekliyor'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-slate-400 hover:text-orange-600 transition-colors"><IconDots /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── SAĞ: AI Öneri + Kategoriler + Promo ─────────────────────────── */}
        <div className="col-span-4 space-y-8">
          {/* AI Öneri */}
          <div className="bg-slate-200/60 p-8 rounded-2xl border border-orange-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-16 -mt-16"
              style={{ background: 'linear-gradient(135deg, #ff6000 0%, #a63c00 100%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="font-extrabold text-slate-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Günün Önerisi</h3>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-6">
                &ldquo;Mevcut ürün açıklamalarınızda{' '}
                <span className="text-orange-600 font-bold">&apos;ergonomik&apos;</span>{' '}
                anahtar kelimesi %20 daha fazla dönüşüm sağlıyor. Yeni içeriklerde bu vurguyu artırın.&rdquo;
              </p>
              <div className="bg-white/60 p-4 rounded-xl border border-white">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">Yapay Zeka şimdi aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popüler Kategoriler */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-50">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              <IconRocket />
              Popüler Kategoriler
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Ev & Yaşam', pct: 82, change: '+14%', up: true },
                { label: 'Elektronik', pct: 65, change: '+8%', up: true },
                { label: 'Moda', pct: 40, change: '-3%', up: false },
              ].map(({ label, pct, change, up }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                    <span className={`text-xs font-bold ${up ? 'text-green-600' : 'text-orange-600'}`}>{change}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${up ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Banner */}
          <div className="rounded-2xl overflow-hidden relative h-48 group cursor-pointer">
            <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-700"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 50%, #2d1810 100%)' }} />
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse at top right, #FF6B35 0%, transparent 60%)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <span className="bg-orange-500 text-[10px] font-bold text-white px-2 py-1 rounded mb-2 inline-block">YENİ ÖZELLİK</span>
              <h4 className="text-white font-bold leading-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Görselden Metin Üretimi Yayında!
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
