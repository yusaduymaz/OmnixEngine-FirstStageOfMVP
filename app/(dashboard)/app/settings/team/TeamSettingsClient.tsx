'use client'

import { useEffect, useState } from 'react'
import { Mail, Trash2, RotateCcw, UserPlus, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Workspace {
  id: string
  name: string
  owner_id: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  created_at: string
  inviteUrl?: string
}

interface Member {
  user_id: string
  role: string
  email?: string
  full_name?: string
}

export default function TeamSettingsClient({ workspaces }: { workspaces: Workspace[] }) {
  const [activeId, setActiveId] = useState(workspaces[0]?.id ?? '')
  const [invites, setInvites] = useState<Invite[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [submitting, setSubmitting] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const refresh = async (id: string) => {
    if (!id) return
    setLoading(true)
    try {
      const [inv, mem] = await Promise.all([
        fetch(`/api/workspaces/${id}/invite`).then((r) => r.json()),
        fetch(`/api/workspaces/${id}/members`).then((r) => (r.ok ? r.json() : { members: [] })),
      ])
      setInvites(inv.invites ?? [])
      setMembers(mem.members ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh(activeId)
  }, [activeId])

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !activeId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/workspaces/${activeId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message ?? 'Davet gönderilemedi')
        return
      }
      toast.success('Davet oluşturuldu')
      setEmail('')
      setInvites((prev) => [data.invite, ...prev])
    } finally {
      setSubmitting(false)
    }
  }

  const revoke = async (inviteId: string) => {
    const res = await fetch(`/api/workspaces/${activeId}/invite?inviteId=${inviteId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Davet iptal edildi')
      setInvites((prev) =>
        prev.map((i) => (i.id === inviteId ? { ...i, revoked_at: new Date().toISOString() } : i)),
      )
    } else {
      toast.error('İptal edilemedi')
    }
  }

  const copy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedToken(id)
    toast.success('Davet linki panoya kopyalandı')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (workspaces.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Takımlar</h1>
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6B7B]">
            Takım davet edebilmek için en az bir workspace'in sahibi veya yöneticisi olmanız gerekiyor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Takımlar</h1>
        <p className="text-sm text-[#6B6B7B] mt-1">
          Workspace üyelerini yönet, yeni kullanıcı davet et ve rolleri ayarla.
        </p>
      </div>

      {/* Workspace seçici */}
      {workspaces.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                activeId === w.id
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                  : 'bg-white text-[#1A1A2E] border-[#E8E4DC] hover:bg-[#FFF2EC]'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* Davet formu */}
      <form
        onSubmit={sendInvite}
        className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2">
          <UserPlus size={16} className="text-[#FF6B35]" />
          <h2 className="font-bold text-[#1A1A2E]">Yeni davet gönder</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kullanici@firma.com"
            className="flex-1 min-w-60 h-10 rounded-xl border border-[#E8E4DC] px-3 text-sm outline-none focus:border-[#FF6B35]/60"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="h-10 rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm outline-none"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editör</option>
            <option value="viewer">İzleyici</option>
          </select>
          <button
            type="submit"
            disabled={submitting || !email}
            className="h-10 px-4 rounded-xl bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#e85d2a] disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {submitting ? <RotateCcw size={14} className="animate-spin" /> : <Mail size={14} />}
            Gönder
          </button>
        </div>
      </form>

      {/* Mevcut üyeler */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E8E4DC] flex items-center justify-between">
          <h3 className="font-bold text-[#1A1A2E]">Üyeler</h3>
          <span className="text-xs text-[#9E9EA8]">{members.length} üye</span>
        </div>
        {members.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#9E9EA8] text-center">
            {loading ? 'Yükleniyor...' : 'Henüz üye yok.'}
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E4DC]">
            {members.map((m) => (
              <li key={m.user_id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[#1A1A2E]">{m.email ?? m.user_id.slice(0, 8)}</p>
                  {m.full_name && <p className="text-xs text-[#9E9EA8]">{m.full_name}</p>}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-[#6B6B7B]">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bekleyen davetler */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E8E4DC] flex items-center justify-between">
          <h3 className="font-bold text-[#1A1A2E]">Davetler</h3>
          <span className="text-xs text-[#9E9EA8]">{invites.length} davet</span>
        </div>
        {invites.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#9E9EA8] text-center">
            {loading ? 'Yükleniyor...' : 'Henüz davet gönderilmedi.'}
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E4DC]">
            {invites.map((inv) => {
              const status = inv.accepted_at
                ? 'Kabul edildi'
                : inv.revoked_at
                  ? 'İptal edildi'
                  : new Date(inv.expires_at) < new Date()
                    ? 'Süresi doldu'
                    : 'Beklemede'
              const isPending = !inv.accepted_at && !inv.revoked_at && new Date(inv.expires_at) > new Date()
              return (
                <li key={inv.id} className="px-5 py-3 flex items-center justify-between text-sm gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A2E] truncate">{inv.email}</p>
                    <p className="text-xs text-[#9E9EA8]">
                      {inv.role.toUpperCase()} · {status} · son geçerlilik {new Date(inv.expires_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.inviteUrl && isPending && (
                      <button
                        onClick={() => copy(inv.inviteUrl!, inv.id)}
                        className="text-xs inline-flex items-center gap-1 rounded-lg bg-[#F8F7F4] hover:bg-[#FFF2EC] px-2 py-1 font-semibold text-[#1A1A2E]"
                      >
                        {copiedToken === inv.id ? <Check size={12} /> : <Copy size={12} />} Link
                      </button>
                    )}
                    {isPending && (
                      <button
                        onClick={() => revoke(inv.id)}
                        className="text-xs inline-flex items-center gap-1 rounded-lg border border-[#EF4444] text-[#EF4444] hover:bg-red-50 px-2 py-1 font-semibold"
                      >
                        <Trash2 size={12} /> İptal
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
