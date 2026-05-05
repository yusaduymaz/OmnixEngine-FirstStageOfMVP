'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Giriş yapmış kullanıcıyı /app'e yönlendiren client-side bileşen
 * Clock skew sorununu bypass eder (Clerk client SDK kendi senkronizasyonunu yapar)
 */
export default function AuthRedirect() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/app')
    }
  }, [isLoaded, isSignedIn, router])

  return null
}
