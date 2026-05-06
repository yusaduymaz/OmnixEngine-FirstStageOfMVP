/**
 * Content Agent — Analyze Skill Tip Tanımları
 */

import type { PlatformId } from '@/prompts/system'

export interface AnalyzeSkillInput {
  userId: string
  url: string
  platforms: PlatformId[]
}

export type CriteriaStatus = 'pass' | 'warn' | 'fail'

export interface CriteriaScore {
  score: number
  status: CriteriaStatus
  message: string
  suggestion?: string | null
  currentValue?: string
}

export interface AnalysisResult {
  id?: string
  overallScore: number
  criteriaScores: {
    titleQuality: CriteriaScore
    descriptionDepth: CriteriaScore
    keywordDensity: CriteriaScore
    platformRules: CriteriaScore
  }
  scrapedData?: {
    title: string
    description: string
    content: string
  }
}
