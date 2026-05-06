'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettingsStore, Language, Country } from '@/hooks/useSettingsStore'
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  ShieldCheck,
  Bell,
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Zap,
  TrendingUp,
  Building,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Briefcase,
} from 'lucide-react'
import type { PlanId, PaidPlanId } from '@/lib/stripe/plans'
import PricingModal from '@/components/billing/PricingModal'
import { notify } from '@/lib/toast'

interface ProfileData {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'member'
  plan: string
  title: string
  phone: string
  company: string
  website: string
  about: string
  notifyProduct: boolean
  notifyCampaign: boolean
  notifySecurity: boolean
}

// design.md renkleri: --color-brand-primary: #FF6B35; --color-brand-secondary: #1A1A2E; --color-bg-base: #F8F7F4; --color-border: #E8E4DC;

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profil' },
  { id: 'brand', label: 'Marka Kimliği' },
  { id: 'region', label: 'Bölge & Dil' },
  { id: 'billing', label: 'Abonelik' },
] as const

interface BillingData {
  plan: string
  creditsUsed: number
  creditsLimit: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    module: string | null
    created_at: string
  }>
}

const PLAN_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  trial: { label: 'Deneme', color: 'text-[#6B6B7B] bg-[#F8F7F4]', icon: <Zap size={14} /> },
  starter: { label: 'Starter', color: 'text-[#FF6B35] bg-[#FFF2EC]', icon: <CreditCard size={14} /> },
  growth: { label: 'Growth', color: 'text-blue-600 bg-blue-50', icon: <TrendingUp size={14} /> },
  agency: { label: 'Agency', color: 'text-purple-600 bg-purple-50', icon: <Building size={14} /> },
  enterprise: { label: 'Enterprise', color: 'text-green-700 bg-green-50', icon: <ShieldCheck size={14} /> },
}

const UPGRADE_PLANS = [
  { id: 'starter' as PlanId, name: 'Starter', price: '₺299/ay', credits: '500 kredi/ay', features: ['2 platform', 'İçerik kütüphanesi', 'E-posta desteği'] },
  { id: 'growth' as PlanId, name: 'Growth', price: '₺799/ay', credits: '2.000 kredi/ay', features: ['Toplu yükleme', 'API erişimi', 'Öncelikli destek'] },
  { id: 'agency' as PlanId, name: 'Agency', price: '₺2.499/ay', credits: '10.000 kredi/ay', features: ['Workspace', 'SLA desteği', 'Özel entegrasyon'] },
]

export default function SettingsTabbedPage() {
  const { language, country, setLanguage, setCountry } = useSettingsStore()
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()

  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<PaidPlanId | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)

  const activeTab = (params.tab as string) || 'profile'

  const fetchBillingData = useCallback(async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/user/billing')
      if (res.ok) {
        const data = await res.json()
        setBillingData(data)
      }
    } catch {
      // sessiz hata
    } finally {
      setBillingLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'billing') fetchBillingData()
  }, [activeTab, fetchBillingData])

  const handleCheckout = async (planId: PaidPlanId) => {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        notify.error(data?.hata ?? data?.message ?? 'Ödeme sayfası açılamadı.')
        return
      }
      window.location.href = data.url
    } catch {
      notify.error('Bağlantı hatası — lütfen tekrar deneyin.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        notify.error(data?.hata ?? 'Abonelik yönetim portali açılamadı.')
        return
      }
      window.location.href = data.url
    } catch {
      notify.error('Bağlantı hatası — lütfen tekrar deneyin.')
    } finally {
      setPortalLoading(false)
    }
  }

  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    website: '',
    about: '',
    notifyProduct: true,
    notifyCampaign: false,
    notifySecurity: true,
  })

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ProfileData | null) => {
        if (!data) return
        setProfile(data)
        setProfileForm({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          company: data.company ?? '',
          title: data.title ?? '',
          phone: data.phone ?? '',
          website: data.website ?? '',
          about: data.about ?? '',
          notifyProduct: data.notifyProduct,
          notifyCampaign: data.notifyCampaign,
          notifySecurity: data.notifySecurity,
        })
      })
      .catch(() => {})
  }, [])
  const resolvedFullName = profileForm.fullName || user?.fullName || ''
  const resolvedEmail = profileForm.email || user?.primaryEmailAddress?.emailAddress || ''
  const completionRate = useMemo(() => {
    const fields = [
      resolvedFullName,
      resolvedEmail,
      profileForm.company,
      profileForm.title,
      profileForm.phone,
      profileForm.website,
      profileForm.about,
    ]
    const filled = fields.filter((field) => field.trim().length > 0).length
    return Math.round((filled / fields.length) * 100)
  }, [profileForm, resolvedEmail, resolvedFullName])

  // Geçerli olmayan bir taba girilirse profile'a yönlendir
  useEffect(() => {
    if (!SETTINGS_TABS.find((tab) => tab.id === activeTab)) {
      router.replace('/app/settings/profile')
    }
  }, [activeTab, router])

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileForm.fullName,
          title: profileForm.title,
          phone: profileForm.phone,
          company: profileForm.company,
          website: profileForm.website,
          about: profileForm.about,
          notifyProduct: profileForm.notifyProduct,
          notifyCampaign: profileForm.notifyCampaign,
          notifySecurity: profileForm.notifySecurity,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaveMessage('✅ Profiliniz güncellendi.')
      } else {
        setSaveMessage(`❌ ${data.hata ?? 'Bir sorun oluştu.'}`)
      }
    } catch {
      setSaveMessage('❌ Sunucuya ulaşılamadı.')
    } finally {
      setProfileSaving(false)
    }
  }

  const getInitials = () => {
    const name = resolvedFullName.trim()
    if (!name) return 'OM'
    return name
      .split(' ')
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2)
  }

  const inputClassName =
    'h-11 w-full rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm text-[#1A1A2E] placeholder:text-[#9E9EA8] outline-none transition-colors focus:border-[#FF6B35]/60'

  return (
    <div className="flex-1 min-h-screen space-y-6 bg-white p-6 pb-20 md:p-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Ayarlar
        </h2>
        <p className="text-sm text-[#6B6B7B]">Hesap, bölge ve abonelik ayarlarını buradan yönetebilirsiniz.</p>
      </div>

      <div className="space-y-4">
        {/* Tabs List */}
        <div className="inline-flex h-11 items-center justify-center rounded-xl bg-white p-1 border border-[#E8E4DC] shadow-sm">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(`/app/settings/${tab.id}`)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#1A1A2E] hover:bg-[#FFF2EC]'
               }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#FFF2EC] text-[#FF6B35] flex items-center justify-center font-bold text-lg">
                    {getInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1A1A2E] truncate">{resolvedFullName || 'Profil Adı'}</p>
                    <p className="text-xs text-[#6B6B7B] truncate">{resolvedEmail || 'E-posta adresi'}</p>
                    {profileForm.title && (
                      <p className="text-xs text-[#9E9EA8] mt-0.5 flex items-center gap-1">
                        <Briefcase size={11} /> {profileForm.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Plan + Rol rozetleri */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(() => {
                    const p = PLAN_LABELS[profile?.plan ?? 'trial'] ?? PLAN_LABELS.trial
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${p.color}`}>
                        {p.icon} {p.label}
                      </span>
                    )
                  })()}
                  {profile?.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#1A1A2E] text-white">
                      <ShieldAlert size={11} /> Admin
                    </span>
                  )}
                  {profile?.role === 'member' && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#F8F7F4] text-[#6B6B7B] border border-[#E8E4DC]">
                      Üye
                    </span>
                  )}
                </div>

                {profile?.role === 'admin' && (
                  <div className="mt-3 rounded-xl border border-[#1A1A2E]/20 bg-[#1A1A2E]/5 p-3">
                    <p className="text-[11px] font-bold text-[#1A1A2E] flex items-center gap-1">
                      <ShieldAlert size={12} /> Admin Hesabı
                    </p>
                    <p className="text-[11px] text-[#6B6B7B] mt-0.5">Tüm yönetim ayrıcalıklarına sahipsiniz. <Link href="/admin" className="text-[#FF6B35] font-semibold">Admin paneline git →</Link></p>
                  </div>
                )}
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-[#E8E4DC] bg-[#FAFAFD] p-3">
                    <p className="text-[11px] uppercase tracking-widest text-[#9E9EA8] font-bold">Profil Tamamlanma</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1A1A2E]">%{completionRate}</p>
                      <BadgeCheck size={16} className="text-[#FF6B35]" />
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#E8E4DC]">
                      <div className="h-2 rounded-full bg-[#FF6B35] transition-all" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E8E4DC] bg-white p-3">
                    <p className="text-[11px] uppercase tracking-widest text-[#9E9EA8] font-bold">Hesap Güvenliği</p>
                    <p className="mt-1 text-sm text-[#1A1A2E]">2 adımlı doğrulama ve oturum güvenliği ayarlarınızı yönetin.</p>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B35] hover:underline"
                    >
                      Güvenlik ayarları
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A2E]">Profil Bilgileri</h3>
                  <p className="text-sm text-[#6B6B7B]">Hesap iletişim ve görünüm bilgilerinizi güncelleyin.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="fullName">Ad Soyad</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="fullName"
                        className={`${inputClassName} pl-10`}
                        value={resolvedFullName}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                        placeholder="Ad Soyad"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="email">E-posta</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="email"
                        type="email"
                        className={`${inputClassName} pl-10`}
                        value={resolvedEmail}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="ornek@alanadi.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="company">Şirket</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="company"
                        className={`${inputClassName} pl-10`}
                        value={profileForm.company}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, company: event.target.value }))}
                        placeholder="Şirket adı"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="title">Unvan / Pozisyon</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="title"
                        className={`${inputClassName} pl-10`}
                        value={profileForm.title}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="E-ticaret Yöneticisi"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="phone">Telefon</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="phone"
                        className={`${inputClassName} pl-10`}
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="+90 5xx xxx xx xx"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="website">Web Sitesi</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
                      <input
                        id="website"
                        className={`${inputClassName} pl-10`}
                        value={profileForm.website}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, website: event.target.value }))}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="about">Kısa Profil Notu</label>
                  <textarea
                    id="about"
                    rows={4}
                    className="w-full rounded-xl border border-[#E8E4DC] bg-white px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#9E9EA8] outline-none transition-colors focus:border-[#FF6B35]/60"
                    value={profileForm.about}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, about: event.target.value }))}
                    placeholder="Markanız ve hedef pazarınız hakkında kısa bilgi..."
                  />
                </div>

                {saveMessage && (
                  <p role="alert" className="rounded-xl border border-[#E8E4DC] bg-[#FFF2EC] px-3 py-2 text-sm text-[#1A1A2E]">
                    {saveMessage}
                  </p>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff5c22] disabled:opacity-60"
                  >
                    {profileSaving ? 'Kaydediliyor...' : 'Profili Kaydet'}
                  </button>
                </div>
              </form>

              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#FF6B35]" />
                  <h4 className="font-bold text-[#1A1A2E]">Bildirim Tercihleri</h4>
                </div>
                <label className="flex items-center justify-between rounded-xl border border-[#E8E4DC] p-3">
                  <span className="text-sm text-[#1A1A2E]">Ürün güncellemeleri</span>
                  <input
                    type="checkbox"
                    checked={profileForm.notifyProduct}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, notifyProduct: event.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-[#E8E4DC] p-3">
                  <span className="text-sm text-[#1A1A2E]">Kampanya bildirimleri</span>
                  <input
                    type="checkbox"
                    checked={profileForm.notifyCampaign}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, notifyCampaign: event.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-[#E8E4DC] p-3">
                  <span className="text-sm text-[#1A1A2E]">Güvenlik uyarıları</span>
                  <input
                    type="checkbox"
                    checked={profileForm.notifySecurity}
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, notifySecurity: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#FF6B35]" />
                  <h4 className="font-bold text-[#1A1A2E]">Güvenlik & Hesap</h4>
                </div>
                <p className="mt-2 text-sm text-[#6B6B7B]">
                  Şifre değişikliği, oturum yönetimi ve iki adımlı doğrulama işlemlerini tek yerden yönetin.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B35] hover:underline"
                >
                  Güvenlik ayarlarına git
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="rounded-2xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Marka Kimliği</h3>
              <p className="text-sm text-[#6B6B7B]">Markanızın iletişim dilini ve kurallarını belirleyin.</p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-[#6B6B7B]">Bu alan henüz geliştirme aşamasındadır.</p>
            </div>
          </div>
        )}

        {activeTab === 'region' && (
          <div className="rounded-2xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Bölge ve Dil Tercihleri</h3>
              <p className="text-sm text-[#6B6B7B]">İçerik üretiminde kullanılacak varsayılan dili ve hedef pazarınızı seçin.</p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="language" className="text-sm font-medium leading-none">Uygulama ve Çıktı Dili</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="flex h-11 w-[300px] items-center justify-between rounded-xl border border-[#E8E4DC] bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6B35]/60"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-[#6B6B7B]">Uygulamanın dilini ve AI&apos;ın üretim dilini belirler.</p>
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium leading-none">Hedef Pazar (Ülke)</label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="flex h-11 w-[300px] items-center justify-between rounded-xl border border-[#E8E4DC] bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6B35]/60"
                >
                  <option value="TR">Türkiye (TR)</option>
                  <option value="US">Amerika Birleşik Devletleri (US)</option>
                  <option value="UK">İngiltere (UK)</option>
                  <option value="DE">Almanya (DE)</option>
                  <option value="FR">Fransa (FR)</option>
                  <option value="IT">İtalya (IT)</option>
                  <option value="ES">İspanya (ES)</option>
                </select>
                <p className="text-xs text-[#6B6B7B]">Seçtiğiniz pazara göre içerik üretimindeki platform seçenekleri dinamik değişir.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Mevcut Plan & Kredi Durumu */}
            <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Abonelik ve Krediler</h3>

              {billingLoading ? (
                <div className="space-y-3">
                  <div className="h-8 w-32 rounded-xl bg-[#F8F7F4] animate-pulse" />
                  <div className="h-4 w-full rounded-lg bg-[#F8F7F4] animate-pulse" />
                </div>
              ) : billingData ? (
                <div className="space-y-5">
                  {/* Plan badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const p = PLAN_LABELS[billingData.plan] ?? PLAN_LABELS.trial
                        return (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${p.color}`}>
                            {p.icon} {p.label}
                          </span>
                        )
                      })()}
                      <span className="text-sm text-[#6B6B7B]">Aktif plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPricingOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e85d2a] transition-colors"
                      >
                        <TrendingUp size={14} />
                        {billingData.plan === 'trial' ? 'Plan Yükselt' : 'Planları Görüntüle'}
                      </button>
                      {billingData.plan !== 'trial' && (
                        <button
                          onClick={handlePortal}
                          disabled={portalLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#1A1A2E] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors disabled:opacity-50"
                        >
                          <CreditCard size={14} />
                          {portalLoading ? 'Yönlendiriliyor...' : 'Aboneliği Yönet'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Kredi progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1A1A2E]">Kredi Kullanımı</span>
                      <span className="text-sm text-[#6B6B7B]">
                        {billingData.creditsUsed} / {billingData.creditsLimit} kredi
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#E8E4DC]">
                      <div
                        className="h-2.5 rounded-full bg-[#FF6B35] transition-all"
                        style={{
                          width: `${Math.min(100, (billingData.creditsUsed / billingData.creditsLimit) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-[#9E9EA8]">
                      {billingData.creditsLimit - billingData.creditsUsed} kredi kaldı
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B6B7B]">Kredi bilgisi yüklenemedi.</p>
              )}
            </div>

            {/* Plan Yükseltme Kartları */}
            {billingData?.plan === 'trial' || billingData?.plan === 'starter' ? (
              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#1A1A2E] mb-4">Planınızı Yükseltin</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {UPGRADE_PLANS.filter((p) => p.id !== billingData?.plan).map((plan) => (
                    <div key={plan.id} className="rounded-xl border border-[#E8E4DC] p-4 space-y-3">
                      <div>
                        <p className="font-bold text-[#1A1A2E]">{plan.name}</p>
                        <p className="text-[#FF6B35] font-semibold text-sm">{plan.price}</p>
                        <p className="text-xs text-[#6B6B7B]">{plan.credits}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-[#6B6B7B]">
                            <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading === plan.id}
                        className="w-full rounded-xl bg-[#FF6B35] py-2 text-sm font-bold text-white hover:bg-[#e85d2a] transition-colors disabled:opacity-60"
                      >
                        {checkoutLoading === plan.id ? 'Yönlendiriliyor...' : `${plan.name}'a Geç`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Son Kredi İşlemleri */}
            {billingData?.transactions && billingData.transactions.length > 0 && (
              <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#1A1A2E] mb-4">Son İşlemler</h4>
                <div className="divide-y divide-[#E8E4DC]">
                  {billingData.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A2E] capitalize">{tx.type}</p>
                        {tx.module && <p className="text-xs text-[#9E9EA8]">{tx.module}</p>}
                        <p className="text-xs text-[#9E9EA8]">
                          {new Date(tx.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-[#EF4444]'}`}>
                        {tx.amount > 0
                          ? <CheckCircle2 size={14} />
                          : <XCircle size={14} />
                        }
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} kredi
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        currentPlan={(billingData?.plan as PlanId) ?? 'trial'}
      />
    </div>
  )
}
