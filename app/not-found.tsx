import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F7F4] px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[120px] font-bold text-[#FF6B35] leading-none" style={{ fontFamily: 'Bricolage Grotesque' }}>
          404
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>
          Sayfa bulunamadı
        </h1>
        <p className="text-sm text-[#6B6B7B] mb-6">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[#FF6B35] text-white rounded-lg font-medium text-sm hover:bg-[#e85a26] transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  )
}
