import { ChevronRight, Maximize, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { ActivityDiagram, ActivitySteps } from '../lib/workshops'

const stageNames = ['Predict', 'Try', 'Reveal']
const defaultButtons = ['Try the activity', 'Reveal the answer', 'Start over']

export function Presenter({
  steps,
  buttons = defaultButtons,
  renderStage,
  canAdvance = true,
  onRestart,
  headingLevel = 2,
}: {
  steps: ActivitySteps
  buttons?: readonly string[]
  renderStage?: (stage: number) => ReactNode
  canAdvance?: boolean | ((stage: number) => boolean)
  onRestart?: () => void
  headingLevel?: 2 | 3
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [presenting, setPresenting] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const previewHeading = useRef<HTMLHeadingElement>(null)
  const projectorHeading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(0)
  const step = steps[stepIndex]
  const lastStep = stepIndex === steps.length - 1
  const advanceAllowed = typeof canAdvance === 'function' ? canAdvance(stepIndex) : canAdvance
  const PromptHeading = headingLevel === 3 ? 'h3' : 'h2'

  useEffect(() => {
    if (presenting) projectorHeading.current?.focus()
  }, [presenting])

  useEffect(() => {
    if (previousStep.current === stepIndex) return
    previousStep.current = stepIndex
    const heading = presenting ? projectorHeading : previewHeading
    heading.current?.focus()
  }, [presenting, stepIndex])

  function advance() {
    if (!advanceAllowed) return
    if (lastStep) {
      setStepIndex(0)
      onRestart?.()
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  function goBack() {
    setStepIndex(Math.max(0, stepIndex - 1))
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return
    if (event.key === 'ArrowRight' && advanceAllowed && !lastStep) {
      event.preventDefault()
      advance()
    }
    if (event.key === 'ArrowLeft' && stepIndex > 0) {
      event.preventDefault()
      goBack()
    }
  }

  function openPresentation() {
    dialog.current?.showModal()
    setPresenting(true)
  }

  function renderActivity(projected: boolean) {
    return (
      <>
        <div className="workshop-presenter-bar">
          <ol aria-label="Activity stages" className="workshop-stages">
            {stageNames.map((name, index) => (
              <li key={name} aria-current={index === stepIndex ? 'step' : undefined}>
                {name}
              </li>
            ))}
          </ol>
          {projected ? (
            <button type="button" className="workshop-secondary workshop-present" onClick={() => dialog.current?.close()}>
              <X size={16} aria-hidden /> Exit presentation
            </button>
          ) : (
            <button type="button" className="workshop-secondary workshop-present" onClick={openPresentation}>
              <Maximize size={16} aria-hidden /> Present
            </button>
          )}
        </div>
        <div className={projected ? 'workshop-step workshop-step--projected' : 'workshop-step'}>
          <div className="space-y-3">
            <PromptHeading className="workshop-step-heading" ref={projected ? projectorHeading : previewHeading} tabIndex={-1}>
              {step.prompt}
            </PromptHeading>
            <p className="whitespace-pre-line">{step.instruction}</p>
          </div>
          {step.diagram && <Diagram diagram={step.diagram} />}
          {renderStage?.(stepIndex)}
          <div className="workshop-controls">
            {stepIndex > 0 && <button className="workshop-secondary" type="button" onClick={goBack}>Back</button>}
            <button type="button" className="workshop-primary" disabled={!advanceAllowed} onClick={advance}>
              {buttons[stepIndex]}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="workshop-card workshop-presenter" aria-label="Presenter mode" onKeyDown={handleKeys}>
        {renderActivity(false)}
      </section>
      <dialog
        className="workshop-projector"
        ref={dialog}
        aria-label="Projector view"
        onClose={() => setPresenting(false)}
        onKeyDown={handleKeys}
      >
        <div className="workshop-projector-inner">
          {presenting && renderActivity(true)}
        </div>
      </dialog>
    </>
  )
}

function Diagram({ diagram }: { diagram: ActivityDiagram }) {
  return (
    <figure className="workshop-diagram">
      <figcaption>{diagram.title}</figcaption>
      <ol className={`workshop-diagram-items workshop-diagram-items--${diagram.layout}`}>
        {diagram.items.map(({ label, detail }, index) => (
          <li key={index}>
            <strong>{label}</strong>
            {detail && <span>{detail}</span>}
            {diagram.layout === 'sequence' && index < diagram.items.length - 1 && (
              <ChevronRight className="workshop-diagram-arrow" size={16} aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </figure>
  )
}
