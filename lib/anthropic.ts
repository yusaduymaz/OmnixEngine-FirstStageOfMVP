// OmniX Engine — Anthropic Claude API İstemcisi
// Claude sonnet-4 (ana) + haiku (fallback) yapılandırması

import Anthropic from '@anthropic-ai/sdk'

// ═══════════════════════════════════════════════════════
// İstemci Yapılandırması
// ═══════════════════════════════════════════════════════

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ═══════════════════════════════════════════════════════
// Model Sabitleri
// ═══════════════════════════════════════════════════════

export const MODELS = {
  PRIMARY: 'claude-3-5-sonnet-20241022' as const,
  FALLBACK: 'claude-3-5-haiku-20241022' as const,
} as const

// ═══════════════════════════════════════════════════════
// Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════════════════

/**
 * Claude API çağrısı — streaming destekli
 * Rate limit aşımında otomatik olarak haiku modeline düşer
 */
export async function createCompletion(params: {
  systemPrompt: string
  userMessage: string
  maxTokens?: number
  model?: string
}) {
  const {
    systemPrompt,
    userMessage,
    maxTokens = 800,
    model = MODELS.PRIMARY,
  } = params

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    return {
      content: response.content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
    }
  } catch (error: unknown) {
    // Rate limit durumunda fallback modele geç
    if (
      error instanceof Anthropic.RateLimitError &&
      model === MODELS.PRIMARY
    ) {
      console.warn('[Claude] Rate limit — haiku fallback modeline geçiliyor')
      return createCompletion({
        ...params,
        model: MODELS.FALLBACK,
      })
    }
    throw error
  }
}

/**
 * Streaming Claude API çağrısı — Vercel AI SDK ile uyumlu
 */
export async function createStreamingCompletion(params: {
  systemPrompt: string
  userMessage: string
  maxTokens?: number
  model?: string
}) {
  const {
    systemPrompt,
    userMessage,
    maxTokens = 800,
    model = MODELS.PRIMARY,
  } = params

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return stream
}

export default anthropic
