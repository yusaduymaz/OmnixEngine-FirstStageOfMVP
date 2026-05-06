'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Pause,
  Play,
  Eye,
  Settings as SettingsIcon,
  Save,
  X,
  Receipt,
  FileText,
  Briefcase,
} from 'lucide-react'

interface User {
  id: string
  clerk_id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member'
  plan: string
  title: string | null
  credits_used: number
  credits_limit: number
  suspended: boolean
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: string
  module: string | null
  reference: string | null
  created_at: string
}

interface SiteSetting {
  key: string
  value: unknown
  description: string | null
  updated_at: string
}

interface Props {
  users: User[]
  stats: { totalUsers: number; totalCreditsUsed: number; newThisMonth: number; planCounts: Record<string, number> }
  recentTransactions: Transaction[]
  siteSettings: SiteSetting[]
}

const PLANS = ['trial', 'starter', 'growth', 'agency', 'enterprise'] as const

const PLAN_COLORS: Record<string, string> = {
  trial: 'text-[#6B6B7B] bg-[#F8F7F4]',
  starter: 'text-[#FF6B35] bg-[#FFF2EC]',
  growth: 'text-blue-600 bg-blue-50',
  agency: 'text-purple-600 bg-purple-50',
  enterprise: 'text-green-700 bg-green-50',
}

type Tab = 'overview' | 'users' | 'content' | 'transactions'

const TAB_VALUES: Tab[] = ['overview', 'users', 'content', 'transactions']

export default function AdminDashboardClient({ users: initialUsers, stats, recentTransactions, siteSettings }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlTab = (searchParams.get('tab') ?? 'overview') as Tab
  const [tab, setTabState] = useState<Tab>(TAB_VALUES.includes(urlTab) ? urlTab : 'overview')

  // URL ile state senkronu
  useEffect(() => {
    if (TAB_VALUES.includes(urlTab) && urlTab !== tab) setTabState(urlTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab])

  const setTab = useCallback(
    (next: Tab) => {
      setTabState(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'overview') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (planFilter && u.plan !== planFilter) return false
      if (roleFilter && u.role !== roleFilter) return false
      if (q) {
        const hay = `${u.email} ${u.full_name ?? ''} ${u.title ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [users, search, planFilter, roleFilter])

  const refetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Admin Paneli</h1>
        <p className="text-sm text-[#6B6B7B] mt-1">OmniX Engine operasyonel kontrol merkezi</p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} className="text-[#FF6B35]" />} bg="bg-[#FFF2EC]" value={stats.totalUsers} label="Toplam Kullanıcı" />
        <StatCard icon={<CreditCard size={18} className="text-blue-600" />} bg="bg-blue-50" value={stats.totalCreditsUsed.toLocaleString('tr-TR')} label="Toplam Kredi Harcandı" />
        <StatCard icon={<TrendingUp size={18} className="text-green-600" />} bg="bg-green-50" value={stats.newThisMonth} label="Bu Ay Yeni Üye" />
        <StatCard icon={<ShieldCheck size={18} className="text-purple-600" />} bg="bg-purple-50" value={(stats.planCounts.enterprise ?? 0) + (stats.planCounts.agency ?? 0)} label="Premium Plan" />
      </div>

      {/* Plan dağılımı */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">Plan Dağılımı</h3>
        <div className="flex flex-wrap gap-2">
          {PLANS.map((p) => (
            <span key={p} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${PLAN_COLORS[p]}`}>
              {p} <span className="text-[#1A1A2E]/70">· {stats.planCounts[p] ?? 0}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mobil sekme barı (sidebar md+ ekranda) */}
      <div className="md:hidden inline-flex h-11 items-center justify-center rounded-xl bg-white p-1 border border-[#E8E4DC] shadow-sm overflow-x-auto">
        {([
          { id: 'overview', label: 'Genel', icon: <ShieldCheck size={14} /> },
          { id: 'users', label: 'Kullanıcılar', icon: <Users size={14} /> },
          { id: 'content', label: 'İçerik', icon: <FileText size={14} /> },
          { id: 'transactions', label: 'İşlemler', icon: <Receipt size={14} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-[#FF6B35] text-white shadow-sm' : 'text-[#1A1A2E] hover:bg-[#FFF2EC]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <UsersTab
          users={filteredUsers}
          search={search}
          setSearch={setSearch}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          onSelect={setSelectedUserId}
          onRefetch={refetchUsers}
        />
      )}

      {tab === 'content' && <SiteContentTab settings={siteSettings} />}

      {tab === 'transactions' && <TransactionsTab transactions={recentTransactions} users={users} />}

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onMutated={() => {
            refetchUsers()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ icon, bg, value, label }: { icon: React.ReactNode; bg: string; value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
        <p className="text-xs text-[#6B6B7B]">{label}</p>
      </div>
    </div>
  )
}

// ─── Kullanıcılar Sekmesi ────────────────────────────────────────────────

function UsersTab({
  users,
  search,
  setSearch,
  planFilter,
  setPlanFilter,
  roleFilter,
  setRoleFilter,
  onSelect,
  onRefetch,
}: {
  users: User[]
  search: string
  setSearch: (v: string) => void
  planFilter: string
  setPlanFilter: (v: string) => void
  roleFilter: string
  setRoleFilter: (v: string) => void
  onSelect: (id: string) => void
  onRefetch: () => void
}) {
  const [creditUserId, setCreditUserId] = useState('')
  const [creditAmount, setCreditAmount] = useState(100)
  const [creditNote, setCreditNote] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditMsg, setCreditMsg] = useState<string | null>(null)

  const handleCreditOp = async (delta: 1 | -1) => {
    if (!creditUserId || creditAmount <= 0) return
    setCreditLoading(true)
    setCreditMsg(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creditUserId, amount: creditAmount * delta, note: creditNote || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreditMsg(`✅ ${Math.abs(creditAmount)} kredi ${delta > 0 ? 'eklendi' : 'düşüldü'}. Yeni limit: ${data.yeniLimit}`)
        setCreditNote('')
        onRefetch()
      } else {
        setCreditMsg(`❌ ${data.hata ?? 'Hata oluştu'}`)
      }
    } finally {
      setCreditLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Manuel kredi ekle/düş */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={16} className="text-[#FF6B35]" />
          <h2 className="font-bold text-[#1A1A2E]">Kredi Ekle / Düş</h2>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5 flex-1 min-w-52">
            <label className="text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Kullanıcı</label>
            <select
              value={creditUserId}
              onChange={(e) => setCreditUserId(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm outline-none focus:border-[#FF6B35]/60"
            >
              <option value="">Kullanıcı seçin...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email} — {u.plan}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Miktar</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              className="h-10 w-32 rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm outline-none focus:border-[#FF6B35]/60"
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-40">
            <label className="text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Not (ops.)</label>
            <input
              value={creditNote}
              onChange={(e) => setCreditNote(e.target.value)}
              placeholder="Sebep / referans"
              className="h-10 w-full rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm outline-none focus:border-[#FF6B35]/60"
            />
          </div>
          <button
            onClick={() => handleCreditOp(1)}
            disabled={!creditUserId || creditLoading}
            className="h-10 px-4 rounded-xl bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#e85d2a] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {creditLoading ? <RotateCcw size={14} className="animate-spin" /> : <Plus size={14} />} Ekle
          </button>
          <button
            onClick={() => handleCreditOp(-1)}
            disabled={!creditUserId || creditLoading}
            className="h-10 px-4 rounded-xl border border-[#EF4444] text-[#EF4444] text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Düş
          </button>
        </div>
        {creditMsg && (
          <p className="mt-3 text-sm rounded-xl border border-[#E8E4DC] bg-[#F8F7F4] px-3 py-2">{creditMsg}</p>
        )}
      </div>

      {/* Filtre + arama */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9EA8]" />
          <input
            placeholder="E-posta, ad veya unvana göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-xl border border-[#E8E4DC] bg-white text-sm outline-none focus:border-[#FF6B35]/60"
          />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-[#E8E4DC] bg-white text-sm outline-none">
          <option value="">Tüm planlar</option>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-[#E8E4DC] bg-white text-sm outline-none">
          <option value="">Tüm roller</option>
          <option value="admin">Admin</option>
          <option value="member">Üye</option>
        </select>
      </div>

      {/* Kullanıcı tablosu */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#F8F7F4]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Kredi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAFAFD] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A1A2E]">{u.email}</p>
                    {u.full_name && <p className="text-xs text-[#9E9EA8]">{u.full_name}</p>}
                    {u.title && <p className="text-[11px] text-[#9E9EA8] flex items-center gap-1"><Briefcase size={10} />{u.title}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1A1A2E] text-white px-2 py-0.5 text-[11px] font-bold">
                        <ShieldAlert size={10} /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B6B7B]">Üye</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${PLAN_COLORS[u.plan] ?? 'text-[#6B6B7B] bg-[#F8F7F4]'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1A1A2E] text-xs">
                    {u.credits_used} / {u.credits_limit}
                  </td>
                  <td className="px-4 py-3">
                    {u.suspended ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#EF4444] font-bold"><Pause size={10} /> Askıda</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-semibold"><Play size={10} /> Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelect(u.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#F8F7F4] hover:bg-[#FFF2EC] px-3 py-1.5 text-xs font-semibold text-[#1A1A2E] transition-colors"
                    >
                      <Eye size={12} /> Detay
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#9E9EA8]">Filtre sonucu yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Site İçerik Editörü ─────────────────────────────────────────────────

function SiteContentTab({ settings }: { settings: SiteSetting[] }) {
  const [items, setItems] = useState(
    settings.map((s) => ({ ...s, draft: JSON.stringify(s.value, null, 2), saving: false, msg: '' as string | null })),
  )

  const save = async (idx: number) => {
    const item = items[idx]
    let parsed: unknown
    try {
      parsed = JSON.parse(item.draft)
    } catch {
      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, msg: '❌ Geçerli JSON girin' } : it)))
      return
    }
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, saving: true, msg: null } : it)))
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: item.key, value: parsed, description: item.description ?? undefined }),
    })
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, saving: false, msg: res.ok ? '✅ Kaydedildi' : '❌ Kaydedilemedi' } : it,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8E4DC] bg-[#FFF2EC]/40 p-4">
        <p className="text-sm text-[#1A1A2E]">
          <strong>Site içerik ayarları</strong> — Landing page, fiyatlandırma başlığı ve üst banner gibi alanları buradan
          JSON formatında düzenleyebilirsiniz. Değişiklikler sayfa yenilendiğinde anında yansır.
        </p>
      </div>
      {items.map((item, idx) => (
        <div key={item.key} className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-[#1A1A2E] font-mono text-sm">{item.key}</h3>
              {item.description && <p className="text-xs text-[#6B6B7B] mt-0.5">{item.description}</p>}
            </div>
            <button
              onClick={() => save(idx)}
              disabled={item.saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B35] text-white text-xs font-bold px-3 py-1.5 hover:bg-[#e85d2a] disabled:opacity-50"
            >
              {item.saving ? <RotateCcw size={12} className="animate-spin" /> : <Save size={12} />} Kaydet
            </button>
          </div>
          <textarea
            value={item.draft}
            onChange={(e) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, draft: e.target.value } : it)))}
            spellCheck={false}
            className="w-full min-h-[140px] rounded-xl border border-[#E8E4DC] bg-[#FAFAFD] px-3 py-2 text-xs font-mono text-[#1A1A2E] outline-none focus:border-[#FF6B35]/60"
          />
          {item.msg && <p className="mt-2 text-xs">{item.msg}</p>}
        </div>
      ))}
    </div>
  )
}

// ─── Kredi İşlemleri Sekmesi ────────────────────────────────────────────

function TransactionsTab({ transactions, users }: { transactions: Transaction[]; users: User[] }) {
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.email])), [users])
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#6B6B7B]">Henüz kredi işlemi bulunmuyor.</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E4DC] bg-[#F8F7F4]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Kullanıcı</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Tür</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Modül</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Miktar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4DC]">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#FAFAFD] transition-colors">
                <td className="px-4 py-3 text-xs text-[#6B6B7B]">{userMap[tx.user_id] ?? tx.user_id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-medium text-[#1A1A2E] capitalize">{tx.type}</td>
                <td className="px-4 py-3 text-[#6B6B7B]">{tx.module ?? '—'}</td>
                <td className={`px-4 py-3 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-[#EF4444]'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </td>
                <td className="px-4 py-3 text-[#9E9EA8] text-xs">
                  {new Date(tx.created_at).toLocaleString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Kullanıcı Detay Modalı ─────────────────────────────────────────────

interface UserDetail {
  user: User & { phone: string | null; company: string | null; website: string | null; about: string | null; suspended_at: string | null; updated_at: string; stripe_customer_id: string | null }
  stats: { generationCount: number; analysisCount: number; imageCount: number }
  transactions: Transaction[]
}

function UserDetailModal({
  userId,
  onClose,
  onMutated,
}: {
  userId: string
  onClose: () => void
  onMutated: () => void
}) {
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [form, setForm] = useState<{ plan: string; role: 'admin' | 'member'; credits_limit: number; title: string; suspended: boolean } | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((d: UserDetail | { hata: string }) => {
        if ('hata' in d) {
          setMsg(`❌ ${d.hata}`)
          setLoading(false)
          return
        }
        setData(d)
        setForm({
          plan: d.user.plan,
          role: d.user.role,
          credits_limit: d.user.credits_limit,
          title: d.user.title ?? '',
          suspended: d.user.suspended,
        })
        setLoading(false)
      })
  }, [userId])

  const save = async () => {
    if (!form) return
    setSaving(true)
    setMsg(null)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: form.plan,
        role: form.role,
        credits_limit: form.credits_limit,
        title: form.title || null,
        suspended: form.suspended,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg('✅ Güncellendi')
      onMutated()
    } else {
      setMsg(`❌ ${json.hata ?? 'Hata'}`)
    }
  }

  const remove = async () => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? (Yumuşak silme)')) return
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    setSaving(false)
    if (res.ok) {
      onMutated()
      onClose()
    } else {
      const j = await res.json()
      setMsg(`❌ ${j.hata ?? 'Silinemedi'}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A2E]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E8E4DC] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-[#1A1A2E] flex items-center gap-2">
            <SettingsIcon size={16} className="text-[#FF6B35]" />
            Kullanıcı Detayı
          </h2>
          <button onClick={onClose} className="text-[#6B6B7B] hover:text-[#1A1A2E]">
            <X size={18} />
          </button>
        </div>

        {loading || !data || !form ? (
          <div className="p-8 text-center text-sm text-[#6B6B7B]">Yükleniyor...</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Profil özet */}
            <div className="rounded-xl border border-[#E8E4DC] bg-[#FAFAFD] p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-[#1A1A2E]">{data.user.full_name ?? '—'}</p>
                  <p className="text-sm text-[#6B6B7B]">{data.user.email}</p>
                  <p className="text-xs text-[#9E9EA8] mt-1 font-mono">Clerk: {data.user.clerk_id}</p>
                </div>
                <div className="text-right text-xs text-[#9E9EA8]">
                  <p>Kayıt: {new Date(data.user.created_at).toLocaleDateString('tr-TR')}</p>
                  {data.user.stripe_customer_id && <p className="font-mono">Stripe: {data.user.stripe_customer_id}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <MiniStat value={data.stats.generationCount} label="Üretim" />
                <MiniStat value={data.stats.analysisCount} label="Analiz" />
                <MiniStat value={data.stats.imageCount} label="Görsel" />
              </div>
              {(data.user.phone || data.user.company || data.user.website) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {data.user.phone && <span className="text-[#6B6B7B]">📞 {data.user.phone}</span>}
                  {data.user.company && <span className="text-[#6B6B7B]">🏢 {data.user.company}</span>}
                  {data.user.website && <span className="text-[#6B6B7B]">🌐 {data.user.website}</span>}
                </div>
              )}
            </div>

            {/* Yönetim formu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Rol">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'member' })} className={selectCls}>
                  <option value="member">Üye</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Plan">
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={selectCls}>
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Kredi Limiti">
                <input
                  type="number"
                  min={0}
                  value={form.credits_limit}
                  onChange={(e) => setForm({ ...form, credits_limit: Number(e.target.value) })}
                  className={selectCls}
                />
              </Field>
              <Field label="Unvan">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="—" className={selectCls} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[#1A1A2E] md:col-span-2">
                <input type="checkbox" checked={form.suspended} onChange={(e) => setForm({ ...form, suspended: e.target.checked })} />
                Hesabı askıya al
              </label>
            </div>

            {msg && <p className="text-sm rounded-xl border border-[#E8E4DC] bg-[#F8F7F4] px-3 py-2">{msg}</p>}

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DC]">
              <button
                onClick={remove}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#EF4444] text-[#EF4444] px-4 py-2 text-sm font-bold hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} /> Kullanıcıyı Sil
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="rounded-xl border border-[#E8E4DC] px-4 py-2 text-sm font-semibold text-[#1A1A2E] hover:bg-[#F8F7F4]">
                  Vazgeç
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] text-white px-4 py-2 text-sm font-bold hover:bg-[#e85d2a] disabled:opacity-50"
                >
                  {saving ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
                </button>
              </div>
            </div>

            {/* Son işlemler */}
            {data.transactions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-2 mt-4">Son Kredi İşlemleri</h4>
                <div className="rounded-xl border border-[#E8E4DC] divide-y divide-[#E8E4DC] max-h-64 overflow-y-auto">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div>
                        <p className="font-semibold text-[#1A1A2E] capitalize">{tx.type} {tx.module && `· ${tx.module}`}</p>
                        <p className="text-[#9E9EA8]">{new Date(tx.created_at).toLocaleString('tr-TR')}</p>
                      </div>
                      <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-[#EF4444]'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const selectCls = 'h-10 w-full rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm outline-none focus:border-[#FF6B35]/60'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#6B6B7B] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-white border border-[#E8E4DC] p-3 text-center">
      <p className="text-lg font-bold text-[#1A1A2E]">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[#9E9EA8] font-semibold">{label}</p>
    </div>
  )
}
