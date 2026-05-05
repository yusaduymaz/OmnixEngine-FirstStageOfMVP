'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Dashboard rotalarını koruyan client-side guard bileşeni
 * Giriş yapılmamışsa /login'e yönlendirir
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/login')
    }
  }, [isLoaded, isSignedIn, router])

  // Henüz yüklenmemişse veya giriş yapılmamışsa loading göster
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B6B7B]">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B6B7B]">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
