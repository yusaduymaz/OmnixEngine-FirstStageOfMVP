'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSettingsStore, Language, Country } from '@/hooks/useSettingsStore'

// design.md renkleri: --color-brand-primary: #FF6B35; --color-brand-secondary: #1A1A2E; --color-bg-base: #F8F7F4; --color-border: #E8E4DC;

export default function SettingsTabbedPage() {
  const { language, country, setLanguage, setCountry } = useSettingsStore()
  const params = useParams()
  const router = useRouter()
  
  const activeTab = (params.tab as string) || 'profile'

  const tabs = [
    { id: 'profile', label: 'Profil' },
    { id: 'brand', label: 'Marka Kimliği' },
    { id: 'region', label: 'Bölge & Dil' },
    { id: 'billing', label: 'Abonelik' },
  ]

  // Geçerli olmayan bir taba girilirse profile'a yönlendir
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      router.replace('/app/settings/profile')
    }
  }, [activeTab, router, tabs])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 pb-20 bg-[#F8F7F4] min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E]" style={{ fontFamily: 'var(--font-bricolage)' }}>Ayarlar</h2>
      </div>

      <div className="space-y-4">
        {/* Tabs List */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-[#E8E4DC]/30 p-1 text-muted-foreground border border-[#E8E4DC]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(`/app/settings/${tab.id}`)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === tab.id
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#1A1A2E] hover:bg-gray-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'profile' && (
          <div className="rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Profil Ayarları</h3>
              <p className="text-sm text-gray-500">Hesap bilgilerinizi buradan yönetebilirsiniz.</p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-500">Bu alan henüz geliştirme aşamasındadır.</p>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Marka Kimliği</h3>
              <p className="text-sm text-gray-500">Markanızın iletişim dilini ve kurallarını belirleyin.</p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-500">Bu alan henüz geliştirme aşamasındadır.</p>
            </div>
          </div>
        )}

        {activeTab === 'region' && (
          <div className="rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Bölge ve Dil Tercihleri</h3>
              <p className="text-sm text-gray-500">İçerik üretiminde kullanılacak varsayılan dili ve hedef pazarınızı seçin.</p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="language" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Uygulama ve Çıktı Dili</label>
                <select 
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="flex h-10 w-[300px] items-center justify-between rounded-md border border-[#E8E4DC] bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-gray-500">Uygulamanın dilini ve AI'ın üretim dilini belirler.</p>
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hedef Pazar (Ülke)</label>
                <select 
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="flex h-10 w-[300px] items-center justify-between rounded-md border border-[#E8E4DC] bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="TR">Türkiye (TR)</option>
                  <option value="US">Amerika Birleşik Devletleri (US)</option>
                  <option value="UK">İngiltere (UK)</option>
                  <option value="DE">Almanya (DE)</option>
                  <option value="FR">Fransa (FR)</option>
                  <option value="IT">İtalya (IT)</option>
                  <option value="ES">İspanya (ES)</option>
                </select>
                <p className="text-xs text-gray-500">Seçtiğiniz pazara göre İçerik Üret ekranındaki platform seçenekleri dinamik olarak değişecektir.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Abonelik ve Krediler</h3>
              <p className="text-sm text-gray-500">Mevcut planınızı ve kullanım istatistiklerinizi görüntüleyin.</p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-500">Bu alan henüz geliştirme aşamasındadır.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
