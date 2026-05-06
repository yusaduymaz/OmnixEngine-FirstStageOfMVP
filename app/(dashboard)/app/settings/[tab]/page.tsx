'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
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
} from 'lucide-react'

// design.md renkleri: --color-brand-primary: #FF6B35; --color-brand-secondary: #1A1A2E; --color-bg-base: #F8F7F4; --color-border: #E8E4DC;

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profil' },
  { id: 'brand', label: 'Marka Kimliği' },
  { id: 'region', label: 'Bölge & Dil' },
  { id: 'billing', label: 'Abonelik' },
] as const

export default function SettingsTabbedPage() {
  const { language, country, setLanguage, setCountry } = useSettingsStore()
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()

  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    website: '',
    about: '',
    notifyProduct: true,
    notifyCampaign: false,
    notifySecurity: true,
  })

  const activeTab = (params.tab as string) || 'profile'
  const resolvedFullName = profileForm.fullName || user?.fullName || ''
  const resolvedEmail = profileForm.email || user?.primaryEmailAddress?.emailAddress || ''
  const completionRate = useMemo(() => {
    const fields = [
      resolvedFullName,
      resolvedEmail,
      profileForm.company,
      profileForm.role,
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

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveMessage('Profil güncelleme entegrasyonu bir sonraki adımda aktif edilecek.')
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
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{resolvedFullName || 'Profil Adı'}</p>
                    <p className="text-xs text-[#6B6B7B]">{resolvedEmail || 'E-posta adresi'}</p>
                  </div>
                </div>
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
                    <label className="text-sm font-semibold text-[#1A1A2E]" htmlFor="role">Pozisyon</label>
                    <input
                      id="role"
                      className={inputClassName}
                      value={profileForm.role}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, role: event.target.value }))}
                      placeholder="E-ticaret yöneticisi"
                    />
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
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff5c22]"
                  >
                    Profili Kaydet
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
          <div className="rounded-2xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Abonelik ve Krediler</h3>
              <p className="text-sm text-[#6B6B7B]">Mevcut planınızı ve kullanım istatistiklerinizi görüntüleyin.</p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-[#6B6B7B]">Bu alan henüz geliştirme aşamasındadır.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
