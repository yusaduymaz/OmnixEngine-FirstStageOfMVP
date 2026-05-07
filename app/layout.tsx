import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Omnix Engine — Global Pazaryerleri için AI İçerik Üreteci',
  description:
    'Global pazaryerleri ve e-ticaret altyapıları (Shopify, Amazon, Etsy) için çok kanallı AI motoru. Saniyeler içinde SEO uyumlu metinler yazın, stüdyo kalitesinde ürün görselleri üretin ve listelemelerinizi analiz edin.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/app"
        signUpFallbackRedirectUrl="/app"
        signInForceRedirectUrl="/app"
        signUpForceRedirectUrl="/app"
        afterSignOutUrl="/"
      >
      <html lang="tr" data-scroll-behavior="smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=DM+Sans:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          <QueryProvider>{children}</QueryProvider>
          <Toaster
            richColors
            position="top-right"
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, system-ui, sans-serif',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}