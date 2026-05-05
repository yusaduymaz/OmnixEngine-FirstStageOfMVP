// OmniX Engine — Görsel Stüdyosu Sayfası
// Sprint 3: AI ile ürün görsel işleme — background removal, studio render

export default function ImageStudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Görsel Stüdyosu</h1>
        <p className="text-muted-foreground">
          Ürün görsellerinizi AI ile profesyonel stüdyo kalitesine yükseltin.
        </p>
      </div>

      {/* TODO: ImageUploader bileşeni */}
      {/* TODO: BeforeAfterViewer bileşeni */}
      {/* TODO: Arka plan renk/stil seçici */}
      {/* TODO: Platform preset seçimi (Trendyol, Amazon vb.) */}

      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          🎨 Görsel Stüdyosu — Sprint 3'te aktif edilecek
        </p>
      </div>
    </div>
  )
}
