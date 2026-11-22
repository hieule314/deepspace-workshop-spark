export const TOPICS = [
  { id: 'binary-search', label: 'Binary search', article: 'Binary search algorithm' },
  { id: 'boolean-logic', label: 'Boolean logic', article: 'Boolean algebra' },
  { id: 'if-else', label: 'If and else', article: 'Conditional (computer programming)' },
  { id: 'rgb-color', label: 'RGB color', article: 'RGB color model' },
  { id: 'binary-numbers', label: 'Binary numbers', article: 'Binary number' },
  { id: 'sorting', label: 'Sorting', article: 'Sorting algorithm' },
  { id: 'graph-paths', label: 'Graph paths', article: 'Path (graph theory)' },
  { id: 'loops', label: 'Loops', article: 'Control flow' },
] as const

export const ACCOUNT_DAILY_LIMIT = 3
export const APP_DAILY_LIMIT = 12
export const CUSTOM_TOPIC = 'custom'
export const CUSTOM_TOPIC_LIMIT = 80
export const NOTES_LIMIT = 600

export type ActivityDiagram = {
  title: string
  layout: 'sequence' | 'comparison' | 'grid'
  items: { label: string; detail?: string }[]
}
export type ActivityStep = { prompt: string; instruction: string; diagram?: ActivityDiagram }
export type ActivitySteps = readonly [ActivityStep, ActivityStep, ActivityStep]
export type ResourceLink = { title: string; url: string }

export type Lesson = {
  title: string
  topic: string
  steps: ActivitySteps
  source: ResourceLink | null
  videos: ResourceLink[]
  materials?: string[]
}
