'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import type { PlanId } from '@/lib/stripe/plans'

const plans = [
  {
    id: null,
    name: 'Ücretsiz Deneme',
    price: '₺0',
    period: 'tek seferlik',
    credits: '50 üretim',
    features: ['Tekil içerik üretimi', '1 platform', 'SEO skoru', 'İçerik kütüphanesi'],
    cta: 'Hemen Başla',
    href: '/register',
    highlight: false,
  },
  {
    id: 'starter' as PlanId,
    name: 'Starter',
    price: '₺299',
    period: '/ ay',
    credits: '500 kredi / ay',
    features: ['2 platform (TY + HB)', 'İçerik kütüphanesi', 'Ekstra anahtar kelime', 'E-posta desteği'],
    cta: "Starter'a Başla",
    href: null,
    highlight: true,
  },
  {
    id: 'growth' as PlanId,
    name: 'Growth',
    price: '₺799',
    period: '/ ay',
    credits: '2.000 kredi / ay',
    features: ['Toplu yükleme (CSV)', 'API erişimi', 'Öncelikli destek', 'Tüm Starter özellikleri'],
    cta: "Growth'a Geç",
    href: null,
    highlight: false,
  },
]

export default function PricingSection() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)

  const handlePaidPlan = async (planId: PlanId) => {
    if (!isSignedIn) {
      router.push('/register')
      return
    }
    setLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) router.push(data.url)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="fiyat" className="py-24 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Fiyatlandırma</p>
          <h2
            className="text-4xl font-bold text-[#1A1A2E] tracking-tight mb-4"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Sadece İhtiyacınız Kadar Ödeyin
          </h2>
          <p className="text-[#6B6B7B] text-lg">Kredi kartı gerekmez. İstediğiniz zaman iptal edin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 border transition-all ${plan.highlight
                ? 'bg-[#1A1A2E] border-[#1A1A2E] shadow-xl shadow-[#1A1A2E]/20'
                : 'bg-white border-[#E8E4DC] hover:shadow-md'
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF6B35] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    En Popüler
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className={`text-sm font-semibold mb-2 ${plan.highlight ? 'text-white/70' : 'text-[#6B6B7B]'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#1A1A2E]'}`}
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/50' : 'text-[#9E9EA8]'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm mt-1 font-medium text-[#FF6B35]">{plan.credits}</p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-[#FF6B35]' : 'text-green-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#6B6B7B]'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link
                  href={plan.href}
                  className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${plan.highlight
                    ? 'bg-[#FF6B35] text-white hover:bg-[#e85d2a] shadow-sm'
                    : 'border border-[#E8E4DC] text-[#1A1A2E] hover:border-[#FF6B35] hover:text-[#FF6B35]'
                    }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => plan.id && handlePaidPlan(plan.id)}
                  disabled={loading === plan.id}
                  className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all disabled:opacity-60 ${plan.highlight
                    ? 'bg-[#FF6B35] text-white hover:bg-[#e85d2a] shadow-sm'
                    : 'border border-[#E8E4DC] text-[#1A1A2E] hover:border-[#FF6B35] hover:text-[#FF6B35]'
                    }`}
                >
                  {loading === plan.id ? 'Yönlendiriliyor...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
