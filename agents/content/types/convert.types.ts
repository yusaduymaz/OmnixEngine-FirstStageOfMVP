import type { PlatformId } from '@/prompts/system'

export interface ConvertSkillInput {
  userId: string
  sourceUrl?: string
  sourceText?: string
  sourcePlatform?: PlatformId | string
  targetPlatforms: PlatformId[]
}

export interface ConvertedPlatformResult {
  platform: PlatformId
  title: string
  description: string
}

export interface ConvertResult {
  results: ConvertedPlatformResult[]
  scrapedData?: {
    title: string
    description: string
    content: string
  }
}
