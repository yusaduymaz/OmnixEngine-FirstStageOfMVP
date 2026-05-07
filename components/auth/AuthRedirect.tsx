'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Giriş yapmış kullanıcıyı /app'e yönlendiren bileşen.
 * Yönlendirme sırasında full-screen overlay gösterir, beyaz ekran beklemesi olmaz.
 */
export default function AuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const isRedirecting = isLoaded && isSignedIn

  useEffect(() => {
    if (isRedirecting) {
      router.replace('/app')
    }
  }, [isRedirecting, router])

  if (!isRedirecting) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F7F4]/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#FF6B35] border-t-transparent animate-spin" />
        <p
          className="text-base font-semibold text-[#1A1A2E] mb-1"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Hesabınıza yönlendiriliyorsunuz…
        </p>
        <p className="text-sm text-[#6B6B7B]">Bu birkaç saniye sürebilir.</p>
      </div>
    </div>
  )
}
