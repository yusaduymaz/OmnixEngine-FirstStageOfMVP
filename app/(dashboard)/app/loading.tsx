export default function AppLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-[#E8E4DC] animate-pulse" />
          <div className="h-4 w-96 rounded bg-[#E8E4DC] animate-pulse" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-white border border-[#E8E4DC] p-5 animate-pulse"
            >
              <div className="h-4 w-1/2 rounded bg-[#E8E4DC] mb-3" />
              <div className="h-8 w-16 rounded bg-[#E8E4DC]" />
            </div>
          ))}
        </div>

        {/* Big card */}
        <div className="h-64 rounded-2xl bg-white border border-[#E8E4DC] animate-pulse" />
      </div>

      <div className="flex items-center justify-center gap-2 mt-10 text-xs text-[#9E9EA8]">
        <div className="w-3 h-3 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin" />
        Yükleniyor…
      </div>
    </div>
  )
}
