import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// DELETE /api/analyses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return Response.json({ hata: 'ID gerekli.' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Kullanıcı ID'sini al
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userData?.id) {
    return Response.json({ hata: 'Kullanıcı bulunamadı.' }, { status: 404 })
  }

  // Sadece kendi kaydını silebilir
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.id)

  if (error) {
    console.error('[Delete/Analyses] Silme hatası:', error)
    return Response.json({ hata: 'Analiz silinemedi.' }, { status: 500 })
  }

  return Response.json({ basarili: true }, { status: 200 })
}
