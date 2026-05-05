export type ImageAction = 'remove-background' | 'replace-background' | 'resize'

export interface ImageProcessInput {
  userId: string
  imageUrl: string // URL veya Base64
  action: ImageAction
  settings?: {
    prompt?: string // replace-background için
    preset?: string // stüdyo preset'i vs.
    width?: number
    height?: number
  }
}

export interface ImageProcessResult {
  originalUrl: string
  processedUrl: string
  modelUsed: string
  processingTimeMs: number
}
