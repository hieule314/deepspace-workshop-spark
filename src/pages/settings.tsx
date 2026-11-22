import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { WorkshopMasthead } from '../components/WorkshopMasthead'
import { seo } from '../seo'
import {
  APPEARANCES,
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  PRESENTER_SIZES,
  readWorkshopPreferences,
  saveWorkshopPreferences,
  type WorkshopPreferences,
} from '../lib/workshop-preferences'

const appearanceLabels = { system: 'System', light: 'Light', dark: 'Dark' }
const sizeLabels = { standard: 'Standard', large: 'Large', 'extra-large': 'Extra large' }

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setPreferences(readWorkshopPreferences())
    function syncPreferences(event: StorageEvent) {
      if (event.key === PREFERENCES_KEY || event.key === null) {
        setPreferences(readWorkshopPreferences())
      }
    }
    window.addEventListener('storage', syncPreferences)
    return () => window.removeEventListener('storage', syncPreferences)
  }, [])

  function update(next: WorkshopPreferences) {
    const saved = saveWorkshopPreferences(next)
    setPreferences(next)
    setMessage(saved ? 'Preferences saved.' : 'Preferences applied for this visit. Browser storage is unavailable.')
  }

  return (
    <>
      <Seo {...seo} path="/settings" title="Settings | Workshop Spark" description="Adjust Workshop Spark’s appearance and projector text size." />
      <WorkshopMasthead />
      <main id="main-content" tabIndex={-1} className="workshop-surface">
        <div className="workshop-shell workshop-shell--settings">
          <header className="workshop-intro workshop-builder-intro">
            <h1>Settings</h1>
            <p>Display preferences are saved in this browser.</p>
          </header>
          <div className="workshop-settings">
            <fieldset className="workshop-card workshop-preference-group" aria-describedby="appearance-description">
              <legend className="workshop-panel-title">Appearance</legend>
              <p id="appearance-description" className="workshop-caption">System follows your device’s light or dark setting.</p>
              <div className="workshop-preference-options">
                {APPEARANCES.map((appearance) => (
                  <label key={appearance}>
                    <input
                      type="radio"
                      name="appearance"
                      checked={preferences.appearance === appearance}
                      onChange={() => update({ ...preferences, appearance })}
                    />
                    {appearanceLabels[appearance]}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="workshop-card workshop-preference-group" aria-describedby="presentation-description">
              <legend className="workshop-panel-title">Presenter text size</legend>
              <p id="presentation-description" className="workshop-caption">Increase text and number tiles in projector view.</p>
              <div className="workshop-preference-options">
                {PRESENTER_SIZES.map((presenterSize) => (
                  <label key={presenterSize}>
                    <input
                      type="radio"
                      name="presenter-size"
                      checked={preferences.presenterSize === presenterSize}
                      onChange={() => update({ ...preferences, presenterSize })}
                    />
                    {sizeLabels[presenterSize]}
                  </label>
                ))}
              </div>
              <div className="workshop-preference-preview">
                <span className="workshop-caption">Preview</span>
                <p>Which number would you guess first?</p>
              </div>
              <Link to="/" className="workshop-link">Try the sample lesson</Link>
            </fieldset>

            <div className="workshop-controls">
              <button type="button" className="workshop-secondary" onClick={() => update(DEFAULT_PREFERENCES)}>Reset defaults</button>
              <p role="status" className="workshop-caption">{message}</p>
            </div>
          </div>
          <div className="workshop-controls">
            <Link to="/account" className="workshop-link">Manage account</Link>
            <Link to="/data-and-use" className="workshop-link">Data and use</Link>
          </div>
        </div>
      </main>
    </>
  )
}
