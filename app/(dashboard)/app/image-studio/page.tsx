'use client'

import { useState, useRef } from 'react'
import { Upload, Link as LinkIcon, Image as ImageIcon, Wand2, Download, Loader2, ArrowRight } from 'lucide-react'
import type { ImageAction, ImageProcessResult } from '@/agents/image/types/process.types'

export default function ImageStudioPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('url')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  
  const [action, setAction] = useState<ImageAction>('remove-background')
  const [preset, setPreset] = useState<string>('mermer')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<ImageProcessResult | null>(null)

  const [sliderPos, setSliderPos] = useState(50)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Dosya boyutu 5MB altında olmalıdır.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedFileUrl(event.target?.result as string)
        setResult(null)
        setErrorMsg(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcess = async () => {
    setErrorMsg(null)
    
    let sourceImage = ''
    if (activeTab === 'url') {
      if (!imageUrlInput) {
        setErrorMsg('Lütfen bir görsel URL\'si girin.')
        return
      }
      sourceImage = imageUrlInput
    } else {
      if (!selectedFileUrl) {
        setErrorMsg('Lütfen bir görsel yükleyin.')
        return
      }
      // Dosya yükle ve URL al
      setIsLoading(true)
      try {
        // Data URL'yi blob'a çevir
        const response = await fetch(selectedFileUrl)
        const blob = await response.blob()
        
        const formData = new FormData()
        formData.append('file', blob, `image_${Date.now()}.jpg`)
        
        const uploadRes = await fetch('/api/images', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Dosya yükleme başarısız.')
        }
        
        sourceImage = uploadData.url
      } catch (err: any) {
        setErrorMsg(err.message || 'Dosya yükleme sırasında hata oluştu.')
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setResult(null)
    setSliderPos(50)

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: sourceImage,
          action,
          settings: action === 'replace-background' ? { preset } : undefined
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.hata || 'Görsel işlenemedi.')

      setResult(data)
      window.scrollTo({ top: 500, behavior: 'smooth' })
    } catch (err: any) {
      setErrorMsg(err.message || 'Bilinmeyen bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result?.processedUrl) return
    const link = document.createElement('a')
    link.href = result.processedUrl
    link.download = `omnix_studio_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white">
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Görsel Stüdyosu (Image Studio)
        </h1>
        <p className="text-[#6B6B7B] text-sm mt-0.5">
          Ürün fotoğraflarınızın arka planını yapay zeka ile profesyonelce kaldırın veya yeni stüdyo ortamlarına yerleştirin.
        </p>
      </div>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===== SOL: KONTROLLER ===== */}
          <div className="lg:col-span-5 space-y-6">
            
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Kaynak Görsel Kartı */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E8E4DC] flex gap-4">
                <button 
                  onClick={() => setActiveTab('url')}
                  className={`text-sm font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${activeTab === 'url' ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#9E9EA8] hover:text-[#1A1A2E]'}`}
                >
                  <LinkIcon className="w-4 h-4" /> Link Yapıştır
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`text-sm font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${activeTab === 'upload' ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#9E9EA8] hover:text-[#1A1A2E]'}`}
                >
                  <Upload className="w-4 h-4" /> Fotoğraf Yükle
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Görsel URL'si <span className="text-[#FF6B35]">*</span></label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Örn: https://.../image.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Bilgisayardan Seç <span className="text-[#FF6B35]">*</span></label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#E8E4DC] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#FF6B35]/50 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-[#9E9EA8] mb-3" />
                      <p className="text-sm font-medium text-[#1A1A2E]">Tıkla veya Sürükle</p>
                      <p className="text-xs text-[#9E9EA8] mt-1">PNG, JPG (Max 5MB)</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                      />
                    </div>
                    {selectedFileUrl && (
                      <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                         <span className="text-xs font-medium text-[#4A4A5E] truncate">Görsel Seçildi</span>
                         <img src={selectedFileUrl} alt="preview" className="w-10 h-10 object-cover rounded" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Aksiyon Kartı */}
            <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden p-6">
               <label className="block text-sm font-medium text-[#1A1A2E] mb-3">Ne Yapmak İstiyorsunuz?</label>
               <div className="space-y-3">
                 <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${action === 'remove-background' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-[#E8E4DC] hover:bg-slate-50'}`}>
                   <input 
                     type="radio" 
                     name="action" 
                     checked={action === 'remove-background'} 
                     onChange={() => setAction('remove-background')} 
                     className="mt-1 text-[#FF6B35] focus:ring-[#FF6B35]" 
                   />
                   <div>
                     <p className="text-sm font-semibold text-[#1A1A2E]">Arka Planı Temizle (Şeffaf Yap)</p>
                     <p className="text-xs text-[#6B6B7B] mt-0.5">Yalnızca ürünü bırakarak arka planı tamamen şeffaf hale getirir.</p>
                   </div>
                 </label>
                 
                 <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${action === 'replace-background' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-[#E8E4DC] hover:bg-slate-50'}`}>
                   <input 
                     type="radio" 
                     name="action" 
                     checked={action === 'replace-background'} 
                     onChange={() => setAction('replace-background')} 
                     className="mt-1 text-[#FF6B35] focus:ring-[#FF6B35]" 
                   />
                   <div>
                     <p className="text-sm font-semibold text-[#1A1A2E]">Stüdyo Ortamı Ekle</p>
                     <p className="text-xs text-[#6B6B7B] mt-0.5">Ürünü AI destekli gerçekçi bir ortama yerleştirir.</p>
                   </div>
                 </label>
               </div>

               {action === 'replace-background' && (
                 <div className="mt-5 pt-5 border-t border-[#E8E4DC]">
                   <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Preset Seçimi</label>
                   <select 
                     value={preset} 
                     onChange={(e) => setPreset(e.target.value)}
                     className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#FF6B35]"
                   >
                     <option value="mermer">Mermer Tezgah (Lüks)</option>
                     <option value="ahsap">Ahşap Zemin Üzerinde (Doğal)</option>
                     <option value="gradient">Canlı Renkli Gradient (Modern)</option>
                   </select>
                 </div>
               )}

               <button
                  onClick={handleProcess}
                  disabled={isLoading}
                  className="w-full h-12 mt-6 rounded-xl bg-[#1A1A2E] hover:bg-[#2A2A3E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Yapay Zeka İşliyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-[#FF6B35]" />
                      Görseli İşle
                    </>
                  )}
               </button>
               <p className="text-center text-xs text-[#9E9EA8] mt-1">~40 kredi/işlem (fal.ai)</p>
            </div>
          </div>

          {/* ===== SAĞ: SONUÇ (ÖNCESİ / SONRASI) ===== */}
          <div className="lg:col-span-7">
            {isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-32 text-center aspect-square md:aspect-auto md:h-[600px]">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF6B35] mb-4" />
                <p className="text-[#1A1A2E] font-medium mb-1 text-lg">Büyü Yapılıyor...</p>
                <p className="text-[#9E9EA8] text-sm max-w-xs mx-auto">Saniyeler içinde harika bir sonuç göreceksiniz. Fal.ai motorları çalışıyor.</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-32 text-center aspect-square md:aspect-auto md:h-[600px] border-dashed">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-[#1A1A2E] font-medium">Görsel Bekleniyor</p>
                <p className="text-[#9E9EA8] text-sm max-w-xs mx-auto mt-1">İşlemi başlattığınızda "Öncesi / Sonrası" kıyaslama ekranı burada belirecek.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-4 rounded-2xl border border-[#E8E4DC] shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-[#FF6B35]" /> İşlem Tamamlandı
                    </h3>
                    <p className="text-xs text-[#6B6B7B] mt-0.5">Süre: {result.processingTimeMs}ms • Model: {result.modelUsed}</p>
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm rounded-lg transition-colors border border-green-200"
                  >
                    <Download className="w-4 h-4" /> İndir (HD)
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden relative" style={{ height: '600px' }}>
                  
                  {/* Checkerboard Background for transparency */}
                  <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiLz4KPC9zdmc+')] opacity-50" />
                  
                  {/* Orijinal Görsel (Arka) */}
                  <div className="absolute inset-0 z-10 select-none">
                    <img src={result.originalUrl} className="w-full h-full object-contain pointer-events-none" alt="Original" />
                  </div>
                  
                  {/* İşlenmiş Görsel (Ön - Clip Path ile) */}
                  <div 
                    className="absolute inset-0 z-20 select-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img src={result.processedUrl} className="w-full h-full object-contain pointer-events-none" alt="Processed" />
                  </div>

                  {/* Slider Control */}
                  <div className="absolute inset-0 z-30" style={{ cursor: 'ew-resize' }}>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute top-1/2 left-0 w-full opacity-0 cursor-ew-resize -translate-y-1/2 h-full z-40" 
                    />
                    {/* Visual Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-30"
                      style={{ left: `calc(${sliderPos}% - 2px)` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-[#1A1A2E]" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 left-4 z-40 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded pointer-events-none">Öncesi</div>
                  <div className="absolute top-4 right-4 z-40 px-2.5 py-1 bg-[#FF6B35]/90 backdrop-blur-sm text-white text-xs font-semibold rounded pointer-events-none">Sonrası</div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
