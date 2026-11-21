import { useState } from 'react'
import type { ActivitySteps } from '../lib/workshops'

const stageNames = ['Predict', 'Try', 'Reveal']
const defaultButtons = ['Try the activity', 'Reveal the answer', 'Start over']

export function Presenter({ steps, buttons = defaultButtons }: {
  steps: ActivitySteps
  buttons?: readonly string[]
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]

  return (
    <section className="overflow-hidden rounded-3xl border border-[#dbe1f4] bg-white shadow-sm" aria-label="Presenter mode">
      <ol aria-label="Activity stages" className="grid grid-cols-3 border-b border-[#dbe1f4] text-center text-sm font-semibold">
        {stageNames.map((name, index) => (
          <li
            key={name}
            aria-current={index === stepIndex ? 'step' : undefined}
            className={index === stepIndex ? 'bg-[#e8edff] px-2 py-4 text-[#293da6]' : 'px-2 py-4 text-[#4f5979]'}
          >
            {name}
          </li>
        ))}
      </ol>

      <div className="space-y-7 p-6 sm:p-9">
        <div aria-live="polite" className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{step.prompt}</h2>
          <p className="max-w-xl whitespace-pre-line text-lg leading-relaxed text-[#4f5979]">{step.instruction}</p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-[#3448b7] px-5 py-3 font-semibold text-white hover:bg-[#293da6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3448b7]"
          onClick={() => setStepIndex((index) => (index + 1) % steps.length)}
        >
          {buttons[stepIndex]}
        </button>
      </div>
    </section>
  )
}
