export default function AuthLoading() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F7F4]">
      {/* Sol marketing skeleton (desktop) */}
      <section className="hidden md:flex w-1/2 bg-[#1A1A2E] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#1A1A2E]/95 to-[#FF6B35]/15" />
        <div className="relative z-10 max-w-lg w-full">
          <div className="h-6 w-40 rounded-full bg-white/10 animate-pulse mb-6" />
          <div className="h-12 w-full rounded-lg bg-white/10 animate-pulse mb-3" />
          <div className="h-12 w-3/4 rounded-lg bg-white/10 animate-pulse mb-10" />
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sağ Clerk skeleton */}
      <section className="w-full md:w-1/2 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md bg-white border border-[#E8E4DC] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 animate-pulse" />
          </div>
          <div className="h-6 w-2/3 mx-auto rounded bg-[#E8E4DC] animate-pulse mb-3" />
          <div className="h-4 w-1/2 mx-auto rounded bg-[#E8E4DC] animate-pulse mb-8" />
          <div className="space-y-3">
            <div className="h-11 rounded-lg bg-[#F8F7F4] animate-pulse" />
            <div className="h-11 rounded-lg bg-[#F8F7F4] animate-pulse" />
            <div className="h-11 rounded-lg bg-[#FF6B35]/30 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-[#9E9EA8]">
            <div className="w-3 h-3 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin" />
            Giriş sayfası hazırlanıyor…
          </div>
        </div>
      </section>
    </main>
  )
}
