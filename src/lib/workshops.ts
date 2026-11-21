export const TOPICS = [
  { id: 'binary-search', label: 'Binary search', article: 'Binary search algorithm' },
  { id: 'boolean-logic', label: 'Boolean logic', article: 'Boolean algebra' },
  { id: 'rgb-color', label: 'RGB color', article: 'RGB color model' },
] as const

export const ACCOUNT_DAILY_LIMIT = 3
export const APP_DAILY_LIMIT = 12

export type ActivityStep = { prompt: string; instruction: string }
export type ActivitySteps = readonly [ActivityStep, ActivityStep, ActivityStep]
export type ResourceLink = { title: string; url: string }

export type Lesson = {
  title: string
  topic: string
  steps: ActivitySteps
  source: ResourceLink
  videos: ResourceLink[]
}
