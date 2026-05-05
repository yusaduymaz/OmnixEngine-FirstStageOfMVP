// OmniX Engine — Stok Yönetimi Sayfası
// Sprint 5: Stok tahmini, yeniden sipariş, anomali tespiti

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stok Yönetimi</h1>
        <p className="text-muted-foreground">
          AI destekli stok tahmini, yeniden sipariş önerileri ve anomali tespiti.
        </p>
      </div>

      {/* TODO: Stok durumu dashboard */}
      {/* TODO: 30/60/90 gün tahmin grafikleri */}
      {/* TODO: Yeniden sipariş önerileri listesi */}
      {/* TODO: Anomali uyarıları */}
      {/* TODO: Sezonsal stok takvimi */}

      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          📦 Stok Yönetimi — Sprint 5'te aktif edilecek
        </p>
      </div>
    </div>
  )
}
