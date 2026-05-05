// OmniX Engine — İçerik Analizörü Sayfası
// Sprint 1-2: URL girdisi → skor + kriter değerlendirmesi + öneriler

export default function AnalyzerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">İçerik Analizörü</h1>
        <p className="text-muted-foreground">
          Ürün sayfanızın URL'sini girin — SEO skoru, kriter analizi ve iyileştirme önerileri alın.
        </p>
      </div>

      {/* TODO: URL girdi alanı */}
      {/* TODO: Platform seçimi */}
      {/* TODO: AnalysisReportCard UI */}
      {/* TODO: Skor göstergeleri */}

      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          🔍 İçerik Analizörü — Sprint 1-2'de aktif edilecek
        </p>
      </div>
    </div>
  )
}
