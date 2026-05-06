'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin/error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E4DC] p-8 text-center">
        <h2 className="text-lg font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>
          Yönetim panelinde bir sorun oluştu
        </h2>
        <p className="text-sm text-[#6B6B7B] mb-5">
          {error.message || 'Beklenmeyen bir hata aldık.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#e85a26]"
          >
            Tekrar Dene
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-white border border-[#E8E4DC] rounded-lg text-sm font-medium hover:bg-[#F8F7F4]"
          >
            Admin Anasayfa
          </Link>
        </div>
      </div>
    </div>
  )
}
