'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Sparkles, Zap, TrendingUp, Building, ShieldCheck, Loader2 } from 'lucide-react'
import { PLANS, type PlanId, type PlanDef, isPaidPlan } from '@/lib/stripe/plans'
import { notify } from '@/lib/toast'

interface Props {
  open: boolean
  onClose: () => void
  currentPlan?: PlanId
}

const ICONS: Record<PlanId, React.ReactNode> = {
  trial: <Sparkles size={20} />,
  starter: <Zap size={20} />,
  growth: <TrendingUp size={20} />,
  agency: <Building size={20} />,
  enterprise: <ShieldCheck size={20} />,
}

const DISPLAY_ORDER: PlanId[] = ['trial', 'starter', 'growth', 'agency', 'enterprise']

export default function PricingModal({ open, onClose, currentPlan = 'trial' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleSelect = async (plan: PlanDef) => {
    if (plan.id === currentPlan) return

    if (plan.cta === 'start_trial') {
      notify.info('Zaten ücretsiz deneme planındasınız.')
      return
    }

    if (plan.cta === 'contact_sales') {
      router.push('/iletisim?plan=enterprise')
      onClose()
      return
    }

    if (!isPaidPlan(plan.id)) return
    if (!plan.priceId) {
      notify.error('Bu plan için ödeme sistemi henüz yapılandırılmadı. Yöneticinize başvurun.')
      return
    }

    setLoading(plan.id)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        notify.error(data?.hata ?? data?.message ?? 'Ödeme sayfası açılamadı.')
        return
      }
      window.location.href = data.url
    } catch (err) {
      console.error(err)
      notify.error('Bağlantı hatası — lütfen tekrar deneyin.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1A1A2E]/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#E8E4DC]">
          <div>
            <h2
              className="text-2xl font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Planınızı Seçin
            </h2>
            <p className="text-sm text-[#6B6B7B] mt-1">
              İhtiyacınıza göre ölçeklenir. İstediğiniz zaman değiştirebilir veya iptal edebilirsiniz.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9E9EA8] hover:text-[#1A1A2E] p-1 rounded-lg hover:bg-[#F8F7F4] transition-colors"
            aria-label="Kapat"
          >
            <X size={22} />
          </button>
        </div>

        {/* Plan grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {DISPLAY_ORDER.map((id) => {
              const plan = PLANS[id]
              const isCurrent = plan.id === currentPlan
              const isLoading = loading === plan.id
              const isRecommended = plan.recommended

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                    isRecommended
                      ? 'border-[#FF6B35] shadow-lg shadow-[#FF6B35]/15 bg-gradient-to-b from-[#FFF7F2] to-white'
                      : 'border-[#E8E4DC] bg-white hover:border-[#FF6B35]/30 hover:shadow-md'
                  } ${isCurrent ? 'ring-2 ring-[#1A1A2E]/30' : ''}`}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Önerilen
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute top-3 right-3 bg-[#1A1A2E] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                      Aktif
                    </span>
                  )}

                  <div className="mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        plan.id === 'enterprise'
                          ? 'bg-green-50 text-green-700'
                          : plan.id === 'agency'
                            ? 'bg-purple-50 text-purple-600'
                            : plan.id === 'growth'
                              ? 'bg-blue-50 text-blue-600'
                              : plan.id === 'starter'
                                ? 'bg-[#FFF2EC] text-[#FF6B35]'
                                : 'bg-[#F8F7F4] text-[#6B6B7B]'
                      }`}
                    >
                      {ICONS[plan.id]}
                    </div>
                    <h3
                      className="text-lg font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-extrabold text-[#1A1A2E] mt-1">{plan.price}</p>
                    <p className="text-xs text-[#6B6B7B] mt-0.5">
                      ~{plan.approxGenerations.toLocaleString('tr-TR')} içerik üretimi/ay
                    </p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs text-[#1A1A2E]">
                        <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelect(plan)}
                    disabled={isLoading || isCurrent}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                      isCurrent
                        ? 'bg-[#F8F7F4] text-[#9E9EA8] cursor-not-allowed'
                        : isRecommended
                          ? 'bg-[#FF6B35] text-white hover:bg-[#e85d2a]'
                          : plan.id === 'enterprise'
                            ? 'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e]'
                            : 'bg-[#1A1A2E]/5 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white'
                    }`}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Yönlendiriliyor…
                      </span>
                    ) : isCurrent ? (
                      'Mevcut planınız'
                    ) : plan.cta === 'contact_sales' ? (
                      'Satış ile İletişim'
                    ) : plan.cta === 'start_trial' ? (
                      'Ücretsiz Başla'
                    ) : (
                      `${plan.name}'a Geç`
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-[#9E9EA8] text-center mt-6">
            Tüm planlarda KDV dahildir. İptaller dönem sonunda işleme alınır. Enterprise için özel
            sözleşme + SLA mevcuttur.
          </p>
        </div>
      </div>
    </div>
  )
}
