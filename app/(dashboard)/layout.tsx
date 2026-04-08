import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Dashboard route group layout — sadece kimlik doğrulama koruma katmanı.
 * Navigasyon ve sidebar her sayfa kendi içinde yönetiyor.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  return <>{children}</>
}
