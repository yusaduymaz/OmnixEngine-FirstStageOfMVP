import AuthGuard from '@/components/auth/AuthGuard'

/**
 * Dashboard route group layout — client-side kimlik doğrulama koruma katmanı.
 * AuthGuard, useAuth() hook'u ile giriş kontrolü yapar.
 * Navigasyon ve sidebar her sayfa kendi içinde yönetiyor.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}
