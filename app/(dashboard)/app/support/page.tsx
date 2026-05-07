import { Suspense } from 'react'
import SupportClient from './SupportClient'

export const metadata = {
  title: 'Destek | OmniX Engine',
  description: 'Destek talebi oluşturun ve geçmiş taleplerinizi görüntüleyin.',
}

function SupportLoading() {
  return (
    <div className="flex-1 min-h-screen bg-white p-6 pb-20 md:p-8">
      <div className="space-y-1 mb-6">
        <div className="h-9 w-32 bg-[#F8F7F4] rounded-lg animate-pulse" />
        <div className="h-5 w-64 bg-[#F8F7F4] rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="h-[400px] bg-[#F8F7F4] rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-8">
          <div className="h-[500px] bg-[#F8F7F4] rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function SupportPage() {
  return (
    <Suspense fallback={<SupportLoading />}>
      <SupportClient />
    </Suspense>
  )
}
