export const APPEARANCES = ['system', 'light', 'dark'] as const
export const PRESENTER_SIZES = ['standard', 'large', 'extra-large'] as const
export const PREFERENCES_KEY = 'workshop.preferences'
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export type WorkshopPreferences = {
  appearance: (typeof APPEARANCES)[number]
  presenterSize: (typeof PRESENTER_SIZES)[number]
}

export const DEFAULT_PREFERENCES: WorkshopPreferences = {
  appearance: 'system',
  presenterSize: 'standard',
}

let sessionPreferences: WorkshopPreferences | undefined

export function readWorkshopPreferences(): WorkshopPreferences {
  if (sessionPreferences) return sessionPreferences
  try {
    const saved: Partial<WorkshopPreferences> | null = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null')
    return {
      appearance: APPEARANCES.find((appearance) => appearance === saved?.appearance) ?? DEFAULT_PREFERENCES.appearance,
      presenterSize: PRESENTER_SIZES.find((size) => size === saved?.presenterSize) ?? DEFAULT_PREFERENCES.presenterSize,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function applyWorkshopPreferences(preferences: WorkshopPreferences) {
  const root = document.documentElement
  root.dataset.appearance = preferences.appearance
  root.dataset.colorScheme = preferences.appearance === 'system'
    ? (window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light')
    : preferences.appearance
  root.dataset.presenterSize = preferences.presenterSize
}

export function saveWorkshopPreferences(preferences: WorkshopPreferences) {
  applyWorkshopPreferences(preferences)
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    sessionPreferences = undefined
    return true
  } catch {
    sessionPreferences = preferences
    return false
  }
}
