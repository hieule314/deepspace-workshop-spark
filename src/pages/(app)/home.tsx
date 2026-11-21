import { useState, type FormEvent } from 'react'
import { getAuthToken, useAuthStatus, useQuery } from 'deepspace'
import { Link } from 'react-router-dom'
import { Presenter } from '../../components/Presenter'
import { ACCOUNT_DAILY_LIMIT, TOPICS, type Lesson } from '../../lib/workshops'

type SavedLesson = { recordId: string; lesson: Lesson }
type GenerationResult = { success: true; data: SavedLesson } | { success: false; error: string }

const sampleLink = 'text-sm font-semibold text-[#293da6] underline underline-offset-4'

export default function HomePage() {
  const { userId, isSignedIn } = useAuthStatus()

  return (
    <div className="min-h-full bg-[#f4f6fe] px-5 py-10 text-[#1b2440] sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 space-y-3">
          <Link className={sampleLink} to="/">Try the sample activity</Link>
          <h1 className="text-4xl font-bold tracking-tight">Create an activity</h1>
          {isSignedIn ? (
            <p className="text-[#4f5979]">Pick a topic for a 10-minute group challenge.</p>
          ) : (
            <p className="text-[#4f5979]">Sign in to create and save activities for your next workshop.</p>
          )}
        </header>
        {isSignedIn && userId && <LessonWorkspace key={userId} />}
      </div>
    </div>
  )
}

function LessonWorkspace() {
  const [topic, setTopic] = useState<string>(TOPICS[0].id)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activity, setActivity] = useState<SavedLesson | null>(null)
  const { records, status } = useQuery<{ lesson: Lesson }>('lessons', { orderBy: 'createdAt', orderDir: 'desc' })

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
        body: JSON.stringify({ topic }),
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
    <div className="space-y-8">
      <form onSubmit={generate} className="space-y-3 rounded-2xl border border-[#dbe1f4] bg-white p-5 sm:p-6">
        <label htmlFor="workshop-topic" className="block font-semibold">Topic</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            id="workshop-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={generating}
            className="min-w-0 flex-1 rounded-lg border border-[#a4aed1] bg-white px-3 py-2.5"
          >
            {TOPICS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
          <button
            disabled={generating}
            className="rounded-lg bg-[#3448b7] px-5 py-2.5 font-semibold text-white hover:bg-[#293da6] disabled:opacity-65"
          >
            {generating ? 'Generating…' : 'Generate and save'}
          </button>
        </div>
        <p className="text-sm text-[#4f5979]">Up to {ACCOUNT_DAILY_LIMIT} generation attempts per day. New activities are saved to your account.</p>
        {generating && <p role="status" className="text-sm text-[#4f5979]">Finding a reference and drafting an activity.</p>}
        {error && <p role="alert" className="text-sm font-medium text-[#9c2929]">{error}</p>}
      </form>

      {activity && <CurrentActivity key={activity.recordId} lesson={activity.lesson} />}

      <section aria-labelledby="saved-activities" className="space-y-3">
        <h2 id="saved-activities" className="text-2xl font-bold tracking-tight">Saved activities</h2>
        {status === 'loading' && <p className="text-[#4f5979]">Loading saved activities…</p>}
        {status === 'error' && <p role="alert" className="text-[#9c2929]">Saved activities could not load.</p>}
        {status === 'ready' && records.length === 0 && <p className="text-[#4f5979]">Your generated activities will appear here.</p>}
        <ul className="space-y-2">
          {records.map(({ recordId, data: { lesson } }) => (
            <li key={recordId}>
              <button
                type="button"
                aria-pressed={activity?.recordId === recordId}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#dbe1f4] bg-white px-4 py-3 text-left hover:border-[#a4aed1] aria-pressed:border-[#3448b7]"
                onClick={() => setActivity({ recordId, lesson })}
              >
                <span className="font-semibold">{lesson.title}</span>
                <span className="text-sm text-[#4f5979]">{lesson.topic}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function CurrentActivity({ lesson }: { lesson: Lesson }) {
  return (
    <section aria-label="Current activity" className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{lesson.title}</h2>
        <p className="mt-1 text-[#4f5979]">{lesson.topic} · 10 minutes · Beginner</p>
      </div>
      <Presenter steps={lesson.steps} />
      <div className="space-y-2 text-sm">
        <a className={sampleLink} href={lesson.source.url} target="_blank" rel="noreferrer">
          Wikipedia reference · {lesson.source.title}
        </a>
        {lesson.videos.length > 0 && (
          <ul className="space-y-1">
            {lesson.videos.map((video) => (
              <li key={video.url}>
                <a className={sampleLink} href={video.url} target="_blank" rel="noreferrer">YouTube · {video.title}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
