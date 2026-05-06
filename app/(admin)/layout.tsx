import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth/admin'
import { ShieldAlert } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin()
  if (!ok) redirect('/')

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <header className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.5 6H14L11 9.5L12.5 15L8 12L3.5 15L5 9.5L2 6H5.5L8 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-sm">OmniX Engine — Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-xs text-white/70 hover:text-white">
            ← Uygulamaya dön
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B35] bg-white/10 px-2 py-1 rounded-full">
            <ShieldAlert size={12} /> Kısıtlı Erişim
          </span>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
