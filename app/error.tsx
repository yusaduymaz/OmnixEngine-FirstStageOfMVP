'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error.tsx]', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-[#E8E4DC] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>
          Bir şeyler ters gitti
        </h1>
        <p className="text-sm text-[#6B6B7B] mb-6">
          Beklenmeyen bir hata oluştu. Tekrar denemek isterseniz aşağıdaki butonu kullanın.
        </p>
        {error.digest && (
          <p className="text-xs text-[#9E9EA8] mb-6 font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#FF6B35] text-white rounded-lg font-medium text-sm hover:bg-[#e85a26] transition-colors"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-white border border-[#E8E4DC] text-[#1A1A2E] rounded-lg font-medium text-sm hover:bg-[#F8F7F4] transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
