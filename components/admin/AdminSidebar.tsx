'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Briefcase,
  ScrollText,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  tab?: string
  icon: React.ReactNode
  disabled?: boolean
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Genel Bakış', tab: 'overview', icon: <LayoutDashboard size={16} /> },
  { href: '/admin?tab=users', label: 'Kullanıcılar', tab: 'users', icon: <Users size={16} /> },
  { href: '/admin?tab=content', label: 'Site İçerikleri', tab: 'content', icon: <FileText size={16} /> },
  { href: '/admin?tab=transactions', label: 'Kredi İşlemleri', tab: 'transactions', icon: <Receipt size={16} /> },
  { href: '/admin?tab=support', label: 'Destek Talepleri', tab: 'support', icon: <MessageSquare size={16} /> },
  { href: '/admin/teams', label: 'Takımlar (Enterprise)', tab: 'teams', icon: <Briefcase size={16} />, disabled: true },
  { href: '/admin/audit', label: 'Denetim Kaydı', tab: 'audit', icon: <ScrollText size={16} />, disabled: true },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const search = useSearchParams()
  const activeTab = search.get('tab') ?? 'overview'

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#E8E4DC] bg-white">
      <div className="px-5 py-5 border-b border-[#E8E4DC]">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6B35]">
          <ShieldAlert size={14} /> Admin
        </span>
        <p className="text-sm text-[#1A1A2E] font-bold mt-1">Operasyonel Panel</p>
      </div>
      <nav className="p-3 space-y-1">
        {NAV.map((item) => {
          const isActive =
            (item.href.startsWith('/admin?') && pathname === '/admin' && activeTab === item.tab) ||
            (!item.href.startsWith('/admin?') && pathname === item.href)

          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9E9EA8] cursor-not-allowed select-none"
                title="Yakında"
              >
                {item.icon} {item.label}
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-[#F8F7F4] text-[#9E9EA8] rounded-full px-2 py-0.5">
                  Yakında
                </span>
              </span>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#1A1A2E] hover:bg-[#FFF2EC]'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
