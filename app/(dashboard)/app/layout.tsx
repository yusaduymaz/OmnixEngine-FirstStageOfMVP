'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { usePlan } from '@/hooks/usePlan'

// ── İkonlar ────────────────────────────────────────────────────────────────

const IconBolt = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconSparkles = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)
const IconLibrary = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const IconHelp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
)

const IconRefresh = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const IconImage = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconCurrency = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.546 1.16 4.455 1.16 6.001 0m-6.001-3.909a4.823 4.823 0 010-6.545M15 11l.879.659c1.546 1.16 4.455 1.16 6.001 0M15 11V5M12 6l.879-.659c1.546-1.16 4.455-1.16 6.001 0" />
  </svg>
)

const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

// ── Nav Linkleri ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/app', label: 'Panel', icon: IconDashboard, exact: true },
  { href: '/app/generate', label: 'İçerik Üretici', icon: IconSparkles, exact: false },
  { href: '/app/analyzer', label: 'Analizör', icon: IconSearch, exact: false },
  { href: '/app/converter', label: 'Dönüştürücü', icon: IconRefresh, exact: false },
  { href: '/app/image-studio', label: 'Görsel Stüdyosu', icon: IconImage, exact: false },
  { href: '/app/pricing', label: 'Fiyat Analizi', icon: IconCurrency, exact: false },
  { href: '/app/inventory', label: 'Envanter Yönetimi', icon: IconBox, exact: false },
  { href: '/app/audits', label: 'Denetim Raporları', icon: IconLibrary, exact: false },
  { href: '/app/library', label: 'Kütüphane', icon: IconLibrary, exact: false },
  { href: '/app/settings/profile', label: 'Ayarlar', icon: IconSettings, exact: false },
]

import { buildCreditDisplay, formatOperationLabel } from '@/lib/billing/credits'

function Sidebar() {
  const pathname = usePathname()
  const { planId, creditsRemaining, creditsLimit, creditsUsed, isLoading } = usePlan()
  
  const display = buildCreditDisplay(creditsUsed, creditsLimit)
  const showUpgrade = !isLoading && (planId === 'trial' || planId === 'starter')

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-orange-100/20 bg-slate-50 flex flex-col p-4 z-50">
      {/* Logo */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #ff6000 0%, #a63c00 100%)' }}
        >
          <IconBolt />
        </div>
        <div>
          <h1
            className="text-xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Omnix Engine
          </h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">
            AI Destekli Yönetim
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'text-orange-600 font-bold bg-orange-50 border-r-4 border-orange-600 rounded-r-none'
                : 'text-slate-500 hover:text-slate-900 hover:bg-orange-50'
                }`}
            >
              <Icon />
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Alt panel */}
      <div className="mt-auto pt-6 border-t border-slate-200 space-y-1">
        <Link
          href="/app/generate"
          className="w-full mb-4 py-3 px-4 flex items-center justify-center gap-2 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #ff6000 0%, #a63c00 100%)',
            fontFamily: 'Bricolage Grotesque, sans-serif',
          }}
        >
          <IconSparkles />
          Yeni İçerik Oluştur
        </Link>

        {showUpgrade && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Kalan Kredi</span>
              <span className="font-semibold text-slate-700">
                {formatOperationLabel(display.operationsRemaining)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-orange-100 rounded-full mb-3">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.max(2, display.usagePercent)}%`,
                  background: display.usagePercent > 80 ? '#ef4444' : 'linear-gradient(90deg,#fb923c,#f97316)'
                }}
              />
            </div>
            <Link href="/app/settings/billing"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-bold shadow-sm shadow-orange-600/20 hover:bg-orange-600 transition-colors">
              ⚡ Plan Yükselt
            </Link>
          </div>
        )}

        <a href="#" className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-900 text-sm rounded-xl hover:bg-slate-100 transition-colors">
          <IconHelp />
          <span>Destek</span>
        </a>

        <SignOutButton redirectUrl="/">
          <button className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 text-sm w-full rounded-xl hover:bg-red-50 transition-colors">
            <IconLogout />
            <span>Çıkış Yap</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}

// ── Layout ──────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      {/* İçerik alanı — sidebar genişliği kadar sola kayar */}
      <div className="min-h-screen bg-white" style={{ marginLeft: '16rem' }}>
        {children}
      </div>
    </div>
  )
}
