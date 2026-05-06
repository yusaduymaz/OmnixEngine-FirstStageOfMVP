'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error.tsx]', error)
  }, [error])

  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8F7F4',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #E8E4DC',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '1.25rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>
              Kritik bir hata oluştu
            </h1>
            <p style={{ color: '#6B6B7B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Uygulamayı yeniden yüklemek isterseniz aşağıdaki butona tıklayın.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#9E9EA8', marginBottom: '1rem', fontFamily: 'monospace' }}>
                Kod: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#FF6B35',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Yeniden Yükle
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
