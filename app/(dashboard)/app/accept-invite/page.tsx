'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Davet bağlantısı geçersiz: token bulunamadı.')
      return
    }
    setStatus('loading')
    fetch('/api/workspaces/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setStatus('ok')
          setMessage('Davet başarıyla kabul edildi. Yönlendiriliyorsunuz...')
          setTimeout(() => router.push('/app'), 1500)
        } else {
          setStatus('error')
          setMessage(data.message ?? 'Davet kabul edilemedi.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Sunucuya ulaşılamadı.')
      })
  }, [token, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm p-8 max-w-md w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <RotateCcw size={32} className="mx-auto text-[#FF6B35] animate-spin" />
            <h1 className="font-bold text-[#1A1A2E]">Davet işleniyor...</h1>
          </>
        )}
        {status === 'ok' && (
          <>
            <CheckCircle2 size={32} className="mx-auto text-green-600" />
            <h1 className="font-bold text-[#1A1A2E]">Hoş geldiniz!</h1>
            <p className="text-sm text-[#6B6B7B]">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={32} className="mx-auto text-[#EF4444]" />
            <h1 className="font-bold text-[#1A1A2E]">Davet kabul edilemedi</h1>
            <p className="text-sm text-[#6B6B7B]">{message}</p>
            <button
              onClick={() => router.push('/app')}
              className="rounded-xl bg-[#FF6B35] text-white px-4 py-2 text-sm font-bold hover:bg-[#e85d2a]"
            >
              Uygulamaya dön
            </button>
          </>
        )}
      </div>
    </div>
  )
}
