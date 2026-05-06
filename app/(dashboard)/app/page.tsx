import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import AuditCenter from '@/components/dashboard/AuditCenter'
import NewsTicker from '@/components/dashboard/NewsTicker'
import {
  Sparkles,
  RefreshCcw,
  SearchCode,
  Megaphone,
  Newspaper,
  BadgePercent,
  TrendingUp,
  History,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Layers,
  BadgeCheck,
  ChevronRight,
  ArrowUpRight,
  Wand2
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

interface SeoRow {
  seo_score: number
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
  let monthlyGenerations = 0
  let avgSeoScore: number | null = null
  let recentGenerations: RecentGen[] = []

  if (user?.id) {
    const { count } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    totalGenerations = count ?? 0

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyCount } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
    monthlyGenerations = monthlyCount ?? 0

    const { data: seoData } = await supabase.from('generations').select('seo_score').eq('user_id', user.id).not('seo_score', 'is', null).limit(30)
    if (seoData?.length) {
      const rows = seoData as SeoRow[]
      const sum = rows.reduce((acc, row) => acc + row.seo_score, 0)
      avgSeoScore = Math.round(sum / seoData.length)
    }

    const { data: genData } = await supabase.from('generations').select('id, product_name, created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    recentGenerations = (genData ?? []) as RecentGen[]
  }

  const creditsRemaining = (user?.credits_limit ?? 50) - (user?.credits_used ?? 0)
  const quickActions = [
    {
      title: 'Sıfırdan Üret',
      description: 'Yeni ürün için SEO odaklı içerik oluştur.',
      href: '/app/generate',
      icon: Sparkles,
      bg: 'bg-[#FFF2EC]',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'Linkten Dönüştür',
      description: 'Mevcut ürün linkini hedef platforma uyarlayın.',
      href: '/app/converter',
      icon: RefreshCcw,
      bg: 'bg-[#FFF2EC]',
      color: 'text-[#FF6B35]'
    },
    {
      title: 'İçeriği Analiz Et',
      description: 'Canlı listing için denetim ve iyileştirme önerisi alın.',
      href: '/app/analyzer',
      icon: SearchCode,
      bg: 'bg-[#FFF2EC]',
      color: 'text-[#FF6B35]'
    },
  ]

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return { label: 'Tamamlandı', className: 'bg-green-50 text-green-700 border-green-200' }
    if (status === 'failed') return { label: 'Başarısız', className: 'bg-red-50 text-red-700 border-red-200' }
    return { label: 'İşleniyor', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  const infoBoxes = [
    {
      title: 'Haftanın Kampanyası',
      description: 'Growth planında yıllık ödemeye geçen hesaplarda %20 indirim aktif.',
      cta: 'Detayı gör',
      href: '/app/settings/billing',
      icon: BadgePercent,
    },
    {
      title: 'Pazar Haberi',
      description: 'Amazon TR kategori bazlı anahtar kelime eşleşme kurallarını güncelledi.',
      cta: 'Analizi aç',
      href: '/app/analyzer',
      icon: Newspaper,
    },
    {
      title: 'Duyuru',
      description: 'Yeni optimize edilmiş prompt akışıyla üretim hızında iyileştirme yayında.',
      cta: 'İçerik üret',
      href: '/app/generate',
      icon: Megaphone,
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="rounded-[24px] border border-[#E8E4DC] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] font-bricolage">Hoş geldin, {firstName} 👋</h2>
            <p className="text-sm text-[#6B6B7B]">Bugün üretim, dönüşüm, analiz ve görsel süreçlerini tek panelden yönetebilirsin.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[#E8E4DC] bg-white px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF2EC] text-[#FF6B35] flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div className="text-xs">
                <p className="text-[#9E9EA8] font-bold uppercase tracking-widest">Kalan Kredi</p>
                <p className="text-[#1A1A2E] font-bold">{creditsRemaining} <span className="text-[#9E9EA8]">/ {user?.credits_limit}</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8E4DC] bg-white px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1A1A2E] text-white flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div className="text-xs">
                <p className="text-[#9E9EA8] font-bold uppercase tracking-widest">Plan</p>
                <p className="text-[#1A1A2E] font-bold uppercase">{user?.plan ?? 'trial'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1A1A2E] font-bricolage">Hızlı Eylemler</h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#6B6B7B]">1 tıkla modül başlat</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[24px] border border-[#E8E4DC] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#FF6B35]/40"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${action.bg} ${action.color}`}>
                <action.icon size={20} />
              </div>
              <h4 className="mt-4 text-base font-bold text-[#1A1A2E]">{action.title}</h4>
              <p className="mt-1 text-sm text-[#6B6B7B] leading-relaxed">{action.description}</p>
              <div className="mt-4 flex items-center text-sm font-semibold text-[#FF6B35]">
                Başlat
                <ArrowUpRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}

          {/* 4. Slot: Kompakt Haber Akışı */}
          <div className="rounded-[24px] border border-[#E8E4DC] bg-[#FAFAFD] p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                <Megaphone size={16} className="text-[#FF6B35]" /> Duyurular
              </h4>
              <span className="text-[10px] font-bold text-[#9E9EA8] uppercase tracking-widest">Yeni</span>
            </div>
            <div className="space-y-4 flex-1">
              {infoBoxes.map((box, i) => (
                <Link
                  key={i}
                  href={box.href}
                  className="group block border-b border-[#E8E4DC] last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-[#1A1A2E] group-hover:text-[#FF6B35] transition-colors truncate">
                      {box.title}
                    </p>
                    <ChevronRight size={12} className="text-[#9E9EA8] group-hover:text-[#FF6B35] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[10px] text-[#6B6B7B] line-clamp-1 mt-0.5">
                    {box.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="rounded-[24px] border border-[#E8E4DC] bg-white p-4 md:p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#1A1A2E]">
          <BadgeCheck size={18} className="text-[#FF6B35]" />
          <h3 className="font-bold font-bricolage">Denetim Merkezi</h3>
        </div>
        <AuditCenter />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF2EC] text-[#FF6B35] flex items-center justify-center">
                <BarChart3 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#9E9EA8] uppercase tracking-widest">Toplam Üretim</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#1A1A2E]">{totalGenerations}</span>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp size={12} /> aktif
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF2EC] text-[#FF6B35] flex items-center justify-center">
                <LayoutDashboard size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#9E9EA8] uppercase tracking-widest">Ortalama SEO</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{avgSeoScore ?? '—'}<span className="text-sm text-[#9E9EA8]"> / 100</span></p>
              </div>
            </div>

          </div>


          <div className="rounded-[24px] border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E8E4DC] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1A2E] font-bricolage flex items-center gap-2">
                <History className="text-[#FF6B35]" size={18} /> Son İşlemler
              </h3>
              <Link href="/app/library" className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center gap-1">
                Tümünü Gör <ChevronRight size={14} />
              </Link>
            </div>

            {recentGenerations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr className="text-[10px] font-bold text-[#9E9EA8] uppercase tracking-widest">
                      <th className="px-6 py-4">Ürün</th>
                      <th className="px-6 py-4">Tarih</th>
                      <th className="px-6 py-4">Durum</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DC]">
                    {recentGenerations.map((gen) => {
                      const status = getStatusLabel(gen.status)
                      return (
                        <tr key={gen.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-[#1A1A2E]">{gen.product_name}</td>
                          <td className="px-6 py-4 text-xs text-[#6B6B7B] font-medium">{relativeDate(gen.created_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-[#9E9EA8] hover:text-[#FF6B35] transition-colors" aria-label="İşlem detayını aç">
                              <ArrowUpRight size={18} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-[#1A1A2E]">Henüz işlem geçmişi bulunmuyor.</p>
                <p className="mt-1 text-xs text-[#6B6B7B]">İlk içeriğini ürettiğinde burada listelenecek.</p>
              </div>
            )}
          </div>
          <section className="relative overflow-hidden bg-[#FF6B35] rounded-[20px] h-11 flex items-center shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 px-4 bg-[#FF6B35] z-10 flex items-center border-r border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Canlı Akış</span>
              </div>
            </div>
            <NewsTicker items={infoBoxes.map(({ icon, ...rest }) => rest)} />
          </section>

        </div>


        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold font-bricolage text-[#1A1A2E]">Performans Özeti</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[#E8E4DC] bg-[#FAFAFD] p-4">
                <p className="text-[11px] uppercase tracking-widest text-[#9E9EA8] font-bold">Bu Ay Üretim</p>
                <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{monthlyGenerations}</p>
              </div>
              <div className="rounded-2xl border border-[#E8E4DC] bg-[#FAFAFD] p-4">
                <p className="text-[11px] uppercase tracking-widest text-[#9E9EA8] font-bold">Ortalama SEO</p>
                <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{avgSeoScore ?? '—'}</p>
              </div>
            </div>
            <Link
              href="/app/settings/billing"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-bold transition-colors hover:bg-[#ff5c22]"
            >
              Kredileri Yönet
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-6 shadow-sm">
            <h4 className="font-bold text-[#1A1A2E]">E-Ticaret İpucu</h4>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6B7B]">
              Dönüşüm oranlarını artırmak için analiz skorunda 70 altı kalan ürünleri önce
              <span className="font-semibold text-[#1A1A2E]"> Analizör</span> ile güncelle, ardından
              <span className="font-semibold text-[#1A1A2E]"> Dönüştürücü</span> ile kanal bazlı optimize et.
            </p>
            <Link href="/app/analyzer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B35] hover:underline">
              Analizöre git
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-6 shadow-sm">
            <h4 className="font-bold text-[#1A1A2E]">Kısayol</h4>
            <div className="mt-3 space-y-2">
              {[
                { label: 'İçerik Üretici', href: '/app/generate' },
                { label: 'Fiyat Analizi', href: '/app/pricing' },
                { label: 'Envanter', href: '/app/inventory' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between rounded-xl border border-[#E8E4DC] px-4 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:border-[#FF6B35]/40 hover:bg-[#FFF2EC]"
                >
                  {link.label}
                  <ChevronRight size={15} className="text-[#9E9EA8]" />
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
