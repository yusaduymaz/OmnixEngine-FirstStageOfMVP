'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  href?: string
  className?: string
  children: React.ReactNode
  prefetch?: boolean
}

/**
 * Tıklandığında küçük loading state gösteren login linki.
 * Beyaz ekran beklemesi yerine kullanıcıya görsel feedback verir.
 */
export default function LoginLink({
  href = '/login',
  className,
  children,
  prefetch = true,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Prefetch login bundle'ı erkenden başlatalım
  useEffect(() => {
    if (prefetch) router.prefetch(href)
  }, [router, href, prefetch])

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={() => setLoading(true)}
      className={className}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Yönlendiriliyor…
        </span>
      ) : (
        children
      )}
    </Link>
  )
}
