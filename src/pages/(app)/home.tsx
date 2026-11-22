import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getAuthToken, useAuthStatus, useQuery } from 'deepspace'
import { Link } from 'react-router-dom'
import { Presenter } from '../../components/Presenter'
import {
  ACCOUNT_DAILY_LIMIT, CUSTOM_TOPIC, CUSTOM_TOPIC_LIMIT, NOTES_LIMIT, TOPICS,
  type Lesson,
} from '../../lib/workshops'

type SavedLesson = { recordId: string; lesson: Lesson }
type GenerationResult = { success: true; data: SavedLesson } | { success: false; error: string }

export default function HomePage() {
  const { userId, isSignedIn } = useAuthStatus()

  return (
    <div className="workshop-surface">
      <div className="workshop-shell workshop-shell--wide">
        <header className="workshop-intro workshop-builder-intro">
          <h1>Create an activity</h1>
          {isSignedIn ? (
            <p>Set up a 10-minute computing challenge for your group.</p>
          ) : (
            <p>Sign in to create and save activities for your next workshop.</p>
          )}
        </header>
        {isSignedIn && userId ? <LessonWorkspace key={userId} /> : (
          <section aria-labelledby="try-sample" className="workshop-card workshop-signed-out">
            <h2 id="try-sample">Try a sample lesson</h2>
            <p>Run a binary search challenge and see what the presenter view looks like.</p>
            <Link to="/" className="workshop-secondary">Open sample lesson</Link>
          </section>
        )}
      </div>
    </div>
  )
}

function LessonWorkspace() {
  const [topic, setTopic] = useState<string>(TOPICS[0].id)
  const [ownTopic, setOwnTopic] = useState(false)
  const [customTopic, setCustomTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activity, setActivity] = useState<SavedLesson | null>(null)

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (generating) return
    setGenerating(true)
    setError('')
    try {
      const token = await getAuthToken()
      if (!token) {
        setError('Your session expired. Sign in and try again.')
        return
      }
      const response = await fetch('/api/actions/generateLesson', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: ownTopic ? CUSTOM_TOPIC : topic,
          customTopic: ownTopic ? customTopic : undefined,
          notes,
        }),
      })
      if (!response.ok) {
        setError(response.status === 401 ? 'Your session expired. Sign in and try again.' : 'The activity could not be generated. Please try again.')
        return
      }
      const result: GenerationResult = await response.json()
      if (result.success) setActivity(result.data)
      else setError(result.error)
    } catch {
      setError('The activity could not be generated. Check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="workshop-workspace">
      <div className="min-w-0 space-y-8">
        <form onSubmit={generate} className="workshop-card workshop-form" aria-labelledby="lesson-setup">
          <h2 id="lesson-setup" className="workshop-panel-title">Lesson setup</h2>
          <fieldset disabled={generating} className="workshop-form-fields">
            <legend className="sr-only">Activity options</legend>
            <fieldset className="workshop-topic-mode">
              <legend>Topic type</legend>
              <label>
                <input type="radio" name="topic-mode" checked={!ownTopic} onChange={() => setOwnTopic(false)} />
                Starter topics
              </label>
              <label>
                <input type="radio" name="topic-mode" checked={ownTopic} onChange={() => setOwnTopic(true)} />
                Use my own topic
              </label>
            </fieldset>
            {ownTopic ? (
              <>
                <label htmlFor="custom-topic">Your topic</label>
                <input
                  id="custom-topic"
                  value={customTopic}
                  onChange={(event) => setCustomTopic(event.target.value)}
                  maxLength={CUSTOM_TOPIC_LIMIT}
                  placeholder="e.g. How computers represent sound"
                  required
                />
              </>
            ) : (
              <>
                <label htmlFor="workshop-topic">Topic</label>
                <select id="workshop-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
                  {TOPICS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                </select>
              </>
            )}

            <label htmlFor="teaching-notes">Teaching notes <span>(optional)</span></label>
            <textarea
              id="teaching-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={NOTES_LIMIT}
              placeholder="e.g. Ages 10–12. We have index cards and a whiteboard. Use a music example."
              aria-describedby="teaching-notes-help"
              rows={3}
            />
            <p id="teaching-notes-help" className="workshop-caption">Add your own example, age group, or supplies. OpenAI uses these notes to draft the activity. <Link to="/data-and-use" className="workshop-link">How your data is used</Link></p>
          </fieldset>
          <div className="workshop-controls">
            <button type="submit" className="workshop-primary" disabled={generating || (ownTopic && !customTopic.trim())}>
              {generating ? 'Generating…' : 'Generate and save'}
            </button>
            <span className="workshop-caption">{ACCOUNT_DAILY_LIMIT} attempts per day</span>
          </div>
          {generating && <p role="status" className="workshop-caption">Looking up the topic and preparing the activity.</p>}
          {error && <p role="alert" className="workshop-error">{error}</p>}
        </form>
        {activity && <CurrentActivity key={activity.recordId} lesson={activity.lesson} />}
      </div>

      <SavedActivities activeId={activity?.recordId} onOpen={setActivity} />
    </div>
  )
}

function SavedActivities({ activeId, onOpen }: { activeId?: string; onOpen: (activity: SavedLesson) => void }) {
  const { records, status } = useQuery<{ lesson: Lesson }>('lessons', { orderBy: 'createdAt', orderDir: 'desc' })
  return (
    <section aria-labelledby="saved-activities" className="workshop-card workshop-library">
      <h2 id="saved-activities" className="workshop-panel-title">Saved activities</h2>
      {status === 'loading' && <p className="workshop-caption">Loading saved activities…</p>}
      {status === 'error' && <p role="alert" className="workshop-error">Saved activities could not load.</p>}
      {status === 'ready' && records.length === 0 && <p className="workshop-caption">Your generated activities will appear here.</p>}
      {records.length > 0 && (
        <ul className="space-y-2">
          {records.map(({ recordId, data: { lesson } }) => (
            <li key={recordId}>
              <button
                type="button"
                aria-pressed={activeId === recordId}
                className="workshop-library-item"
                onClick={() => onOpen({ recordId, lesson })}
              >
                <span className="font-semibold">{lesson.title}</span>
                <span className="workshop-caption">{lesson.topic}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CurrentActivity({ lesson }: { lesson: Lesson }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus(), [])

  return (
    <article aria-labelledby="activity-title" className="space-y-4">
      <header>
        <h2 id="activity-title" ref={title} tabIndex={-1} className="workshop-activity-title">{lesson.title}</h2>
        <p className="workshop-caption">{lesson.topic} · 10 minutes · Beginner</p>
      </header>
      {!!lesson.materials?.length && (
        <div className="workshop-materials">
          <h3>Materials</h3>
          <ul>
            {lesson.materials.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      )}
      <Presenter steps={lesson.steps} headingLevel={3} />
      <aside className="workshop-card workshop-resources" aria-label="Facilitator resources">
        <h3>Resources</h3>
        {lesson.source ? (
          <a className="workshop-link" href={lesson.source.url} target="_blank" rel="noreferrer">
            Wikipedia · {lesson.source.title}
          </a>
        ) : (
          <p className="workshop-caption">A Wikipedia reference wasn’t available for this activity.</p>
        )}
        {lesson.videos.length > 0 && (
          <ul className="space-y-1">
            {lesson.videos.map((video) => (
              <li key={video.url}>
                <a className="workshop-link" href={video.url} target="_blank" rel="noreferrer">YouTube · {video.title}</a>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </article>
  )
}
