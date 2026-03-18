import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const openaiKey = process.env.OPENAI_API_KEY
const anthropicKey = process.env.ANTHROPIC_API_KEY

export const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
export const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null

export const isOpenAIAvailable = !!openai
export const isAnthropicAvailable = !!anthropic

/** Of er ten minste één AI-provider beschikbaar is voor de gevraagde agent */
export function isProviderAvailable(platform: 'openai' | 'anthropic'): boolean {
  return platform === 'openai' ? isOpenAIAvailable : isAnthropicAvailable
}
