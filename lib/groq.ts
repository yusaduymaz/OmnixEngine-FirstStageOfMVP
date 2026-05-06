// OmniX Engine — Groq API İstemcisi
// Ücretsiz, hızlı LLM çağrıları için Groq'u kullan
// https://console.groq.com — ücretsiz API key

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Mevcut modeller (free tier'da kullanılabilir)
export const GROQ_MODELS = {
  PRIMARY: 'llama-3.3-70b-versatile',      // Hızlı, iyi kalite
  FALLBACK: 'llama-3.1-8b-instant',        // Daha hafif fallback
} as const

/**
 * Groq ile completion çağrısı (non-streaming)
 */
export async function createGroqCompletion(params: {
  systemPrompt: string
  userMessage: string
  maxTokens?: number
  model?: string
}) {
  const {
    systemPrompt,
    userMessage,
    maxTokens = 800,
    model = GROQ_MODELS.PRIMARY,
  } = params

  try {
    const response = await groq.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    })

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
      model: response.model,
    }
  } catch (error: unknown) {
    console.error('[Groq] API Error:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Groq ile streaming çağrısı
 */
export async function createGroqStreamingCompletion(params: {
  systemPrompt: string
  userMessage: string
  maxTokens?: number
  model?: string
}) {
  const {
    systemPrompt,
    userMessage,
    maxTokens = 800,
    model = GROQ_MODELS.PRIMARY,
  } = params

  const stream = await groq.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    stream: true,
  })

  return stream
}

export default groq
