import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Presenter } from '../components/Presenter'
import { Seo } from '../components/Seo'
import { WorkshopMasthead } from '../components/WorkshopMasthead'
import { seo } from '../seo'
import type { ActivitySteps } from '../lib/workshops'

const lastNumber = 31
const numbers = Array.from({ length: lastNumber }, (_, index) => index + 1)
const choices = [1, 16] as const

export default function Landing() {
  const [guess, setGuess] = useState<(typeof choices)[number] | null>(null)
  const firstRemaining = (guess ?? 1) + 1
  const remaining = lastNumber - firstRemaining + 1
  const nextGuess = Math.floor((firstRemaining + lastNumber) / 2)

  const steps: ActivitySteps = [
    {
      prompt: 'Which number would you guess first?',
      instruction: 'Someone picked a secret number from 1 to 31. After each guess, they say “higher,” “lower,” or “correct.” Pick a first guess and explain why.',
    },
    {
      prompt: `You guess ${guess}. The answer is “higher.”`,
      instruction: `Numbers 1 through ${guess} are ruled out. Which number in the remaining range would you try next?`,
    },
    {
      prompt: `Guess ${nextGuess} next.`,
      instruction: `It’s the midpoint of ${firstRemaining} through ${lastNumber}. If you start at 1 and hear “higher,” 30 numbers remain. Start at 16 and hear the same clue, and only 15 remain. Repeating this strategy finds any number in the original range in at most five guesses.`,
    },
  ]

  return (
    <>
      <Seo {...seo} path="/" />
      <WorkshopMasthead />
      <main id="main-content" tabIndex={-1} data-testid="static-landing" className="workshop-surface">
        <div className="workshop-shell">
          <div className="workshop-sample-layout">
            <div className="workshop-intro workshop-sample-intro">
              <p className="workshop-meta">Sample lesson · Binary search</p>
              <h1>Guess my number</h1>
              <p>Help beginners see how one smart guess can rule out half the possibilities.</p>
              <dl className="workshop-lesson-facts">
                <div><dt>Time</dt><dd>10 minutes</dd></div>
                <div><dt>Materials</dt><dd>On-screen board</dd></div>
              </dl>
              <Link to="/if-else" className="workshop-link">Try the if/else lesson</Link>
            </div>
            <Presenter
              steps={steps}
              buttons={['See what remains', 'Reveal the next guess', 'Start over']}
              canAdvance={guess !== null}
              onRestart={() => setGuess(null)}
              renderStage={(stage) => (
                <>
                  <figure className="workshop-number-board">
                    <figcaption>
                      {stage === 0 ? 'All 31 numbers are possible' : `${remaining} possibilities remain · ${firstRemaining} to ${lastNumber}`}
                    </figcaption>
                    <div className="workshop-number-line" aria-hidden="true">
                      {numbers.map((number) => {
                        const ruledOut = stage > 0 && number < firstRemaining
                        const highlighted = (stage === 2 && number === nextGuess) || (stage === 0 && number === guess)
                        return (
                          <span key={number} data-state={ruledOut ? 'ruled-out' : highlighted ? 'highlighted' : 'possible'}>
                            {number}
                          </span>
                        )
                      })}
                    </div>
                  </figure>
                  {stage === 0 && (
                    <div className="workshop-choices" role="group" aria-label="First guess">
                      {choices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          className="workshop-secondary"
                          aria-pressed={guess === choice}
                          onClick={() => setGuess(choice)}
                        >
                          Guess {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </main>
    </>
  )
}
