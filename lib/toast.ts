import { toast as sonnerToast, type ExternalToast } from 'sonner'

type Opts = ExternalToast

export const notify = {
  success: (msg: string, opts?: Opts) => sonnerToast.success(msg, opts),
  error: (msg: string, opts?: Opts) => sonnerToast.error(msg, opts),
  info: (msg: string, opts?: Opts) => sonnerToast.info(msg, opts),
  warning: (msg: string, opts?: Opts) => sonnerToast.warning(msg, opts),
  loading: (msg: string, opts?: Opts) => sonnerToast.loading(msg, opts),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: sonnerToast.promise,
}

export const messages = {
  saved: 'Değişiklikler kaydedildi.',
  saveFailed: 'Kaydetme sırasında bir hata oluştu.',
  copied: 'Panoya kopyalandı.',
  networkError: 'Bağlantı hatası — lütfen tekrar deneyin.',
  insufficientCredits: 'Krediniz bu işlem için yetersiz. Lütfen plan yükseltin.',
  unauthorized: 'Bu işlem için yetkiniz yok.',
  generic: 'Beklenmeyen bir hata oluştu.',
}
