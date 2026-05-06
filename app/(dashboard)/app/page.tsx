import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import AuditCenter from '@/components/dashboard/AuditCenter'
import {
  TrendingUp,
  History,
  LayoutDashboard,
  CreditCard,
  BarChart4,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard — Omnix Engine',
}

interface RecentGen {
  id: string
  product_name: string
  created_at: string
  status: string
}

function relativeDate(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 8400) return `${Math.floor(diff / 3600)} sa önce`
  return new Date(isoDate).toLocaleDateString('tr-TR')
}

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const firstName = clerkUser.firstName ?? clerkUser.username ?? 'Kullanıcı'
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
    const { count } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    totalGenerations = count ?? 0

    const { data: seoData } = await supabase.from('generations').select('seo_score').eq('user_id', user.id).not('seo_score', 'is', null).limit(30)
    if (seoData?.length) {
      const sum = seoData.reduce((acc: number, r: any) => acc + r.seo_score, 0)
      avgSeoScore = Math.round(sum / seoData.length)
    }

    const { data: genData } = await supabase.from('generations').select('id, product_name, created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    recentGenerations = (genData ?? []) as RecentGen[]
  }

  const creditsRemaining = (user?.credits_limit ?? 50) - (user?.credits_used ?? 0)

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10">
      {/* ── Üst Bar ── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-bricolage">Hoş geldin, {firstName} 👋</h2>
          <p className="text-sm text-slate-500">Bugün 4 farklı AI ajanıyla e-ticaret stratejini optimize etmeye hazır mısın?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <CreditCard size={16} />
            </div>
            <div className="text-xs">
              <p className="text-slate-400 font-bold uppercase tracking-widest">Kalan Kredi</p>
              <p className="text-slate-900 font-bold">{creditsRemaining} <span className="opacity-40">/ {user?.credits_limit}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MERKEZ: AUDIT CENTER ── */}
      <AuditCenter />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── SOL KOLON: İstatistikler ve Geçmiş ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* İstatistik Özetleri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-orange-200 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart4 size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Toplam Üretim</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{totalGenerations}</span>
                  <span className="text-xs font-bold text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> +12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ortalama SEO</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{avgSeoScore ?? '—'}</span>
                  <span className="text-xs font-bold text-slate-400">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Son Üretimler Tablosu */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 font-bricolage flex items-center gap-2">
                <History className="text-orange-600" size={20} /> Son İşlemler
              </h3>
              <Link href="/app/library" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Ürün</th>
                    <th className="px-8 py-4">Tarih</th>
                    <th className="px-8 py-4">Durum</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentGenerations.map((gen) => (
                    <tr key={gen.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-800">{gen.product_name}</td>
                      <td className="px-8 py-5 text-xs text-slate-500 font-medium">{relativeDate(gen.created_at)}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${gen.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                          {gen.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-orange-600 transition-colors">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SAĞ KOLON: Kısayollar ve Bilgi ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Hızlı Kısayollar */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
            <h3 className="text-lg font-bold font-bricolage mb-6">Hızlı Erişim</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'İçerik Üret', href: '/app/generate', color: 'bg-white/10' },
                { label: 'Görsel Stüdyosu', href: '/app/image-studio', color: 'bg-white/10' },
                { label: 'Fiyat Analizi', href: '/app/pricing', color: 'bg-white/10' },
                { label: 'Envanter', href: '/app/inventory', color: 'bg-white/10' }
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`w-full py-4 px-6 rounded-2xl ${link.color} hover:bg-orange-600 transition-all font-bold text-sm flex items-center justify-between group`}
                >
                  {link.label}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI İpucu */}
          <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-8 space-y-4">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <TrendingUp size={20} />
            </div>
            <h4 className="font-bold text-slate-900">E-Ticaret İpucu</h4>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "Amazon'da 'A+ Content' kullanımı dönüşüm oranlarını %15 artırıyor. Görsel stüdyomuzu kullanarak bu içerikleri optimize edebilirsiniz."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
