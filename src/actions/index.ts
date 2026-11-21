import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'
import { generateLesson } from './generate-lesson'

export const actions: Record<string, ActionHandler<Env>> = { generateLesson }
