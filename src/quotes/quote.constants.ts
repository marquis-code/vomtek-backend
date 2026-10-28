export const QUOTE_STATUSES = [
  'received',
  'engineering_review',
  'quoted',
  'approved',
  'in_build',
  'shipped',
  'closed',
  'cancelled',
] as const

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const PROJECT_TYPES = [
  'control-panel',
  'retrofit',
  'pcb',
  'harness',
  'motor',
  'field',
  'multiple',
  'other',
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]
