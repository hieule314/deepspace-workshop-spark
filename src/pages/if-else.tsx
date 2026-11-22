import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Presenter } from '../components/Presenter'
import { Seo } from '../components/Seo'
import { WorkshopMasthead } from '../components/WorkshopMasthead'
import type { ActivitySteps } from '../lib/workshops'
import { seo } from '../seo'

const actions = ['Bring an umbrella', 'Leave the umbrella at home'] as const
const forecasts = ['Rain', 'Clear'] as const
type Forecast = (typeof forecasts)[number]
type UmbrellaAction = (typeof actions)[number]

const steps: ActivitySteps = [
  {
    prompt: 'What should you do if it’s raining?',
    instruction: 'Imagine you’re about to leave for school. The program checks the weather and tells you what to do. Predict its advice for a rainy day.',
  },
  {
    prompt: 'Run the same program with two forecasts.',
    instruction: 'Select Rain, then run the program. Switch to Clear and run it again. Watch which branch runs each time.',
  },
  {
    prompt: 'One condition. Two possible paths.',
    instruction: 'The if branch runs when the condition is true. The else branch runs when it is false. Try explaining which branch would run if you changed the condition to “is it sunny?”',
  },
]

function umbrellaAction(forecast: Forecast): UmbrellaAction {
  if (forecast === 'Rain') {
    return 'Bring an umbrella'
  } else {
    return 'Leave the umbrella at home'
  }
}

function exampleCode(forecast: Forecast) {
  return `const isRaining = ${forecast === 'Rain'};

if (isRaining) {
  console.log("${umbrellaAction('Rain')}");
} else {
  console.log("${umbrellaAction('Clear')}");
}`
}

export default function IfElseLesson() {
  const [prediction, setPrediction] = useState<UmbrellaAction | null>(null)
  const [forecast, setForecast] = useState<Forecast>('Rain')
  const [lastRun, setLastRun] = useState<Forecast | null>(null)
  const [tested, setTested] = useState<Forecast[]>([])
  const [representation, setRepresentation] = useState<'blocks' | 'javascript'>('blocks')

  function chooseForecast(next: Forecast) {
    if (next === forecast) return
    setForecast(next)
    setLastRun(null)
  }

  function runProgram() {
    setLastRun(forecast)
    setTested((previous) => previous.includes(forecast) ? previous : [...previous, forecast])
  }

  function startOver() {
    setPrediction(null)
    setForecast('Rain')
    setLastRun(null)
    setTested([])
    setRepresentation('blocks')
  }

  return (
    <>
      <Seo {...seo} path="/if-else" title="If and else | Workshop Spark" description="Predict whether to bring an umbrella, then run the same if/else decision using two forecasts." />
      <WorkshopMasthead />
      <main id="main-content" tabIndex={-1} className="workshop-surface">
        <div className="workshop-shell">
          <div className="workshop-sample-layout">
            <div className="workshop-intro workshop-sample-intro">
              <p className="workshop-meta">Sample lesson · Conditions</p>
              <h1>Bring an umbrella?</h1>
              <p>Use an everyday decision to show how a program chooses which instructions to run.</p>
              <dl className="workshop-lesson-facts">
                <div><dt>Time</dt><dd>10 minutes</dd></div>
                <div><dt>Materials</dt><dd>On-screen runner</dd></div>
              </dl>
              <Link to="/" className="workshop-link">Try the binary search lesson</Link>
            </div>
            <Presenter
              steps={steps}
              buttons={['Test your prediction', 'Explain the branches', 'Start over']}
              canAdvance={(stage) => stage === 0 ? prediction !== null : stage === 1 ? tested.length === forecasts.length : true}
              onRestart={startOver}
              renderStage={(stage) => {
                if (stage === 0) {
                  return (
                    <div className="workshop-choices" role="group" aria-label="Your prediction">
                      {actions.map((action) => (
                        <button key={action} type="button" className="workshop-secondary" aria-pressed={prediction === action} onClick={() => setPrediction(action)}>
                          {action}
                        </button>
                      ))}
                    </div>
                  )
                }

                if (stage === 2) {
                  return (
                    <div className="workshop-code-result">
                      <strong>For rain, you predicted “{prediction}.”</strong>
                      <span>The program chose “{umbrellaAction('Rain')}.”</span>
                    </div>
                  )
                }

                return (
                  <div className="workshop-code-lab">
                    <div className="workshop-controls" role="group" aria-label="Forecast">
                      {forecasts.map((option) => (
                        <button key={option} type="button" className="workshop-secondary" aria-pressed={forecast === option} onClick={() => chooseForecast(option)}>
                          {option}
                        </button>
                      ))}
                      <button type="button" className="workshop-primary" onClick={runProgram}>Run program</button>
                    </div>
                    <div className="workshop-choices" role="group" aria-label="Program view">
                      <button type="button" className="workshop-secondary" aria-pressed={representation === 'blocks'} onClick={() => setRepresentation('blocks')}>Blocks</button>
                      <button type="button" className="workshop-secondary" aria-pressed={representation === 'javascript'} onClick={() => setRepresentation('javascript')}>JavaScript</button>
                    </div>
                    {representation === 'javascript' ? (
                      <pre className="workshop-code-example" aria-label="JavaScript example"><code>{exampleCode(forecast)}</code></pre>
                    ) : (
                      <ol className="workshop-code-branches" aria-label="If and else blocks">
                        {forecasts.map((option) => (
                          <li key={option} data-running={lastRun === option}>
                            <strong>{option === 'Rain' ? 'IF raining' : 'ELSE'}</strong>
                            <span>{umbrellaAction(option)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    <output className="workshop-code-result">
                      {lastRun ? (
                        <>
                          <strong>{lastRun === 'Rain' ? 'IF branch ran' : 'ELSE branch ran'}</strong>
                          <span>{umbrellaAction(lastRun)}</span>
                        </>
                      ) : (
                        <span>Select a forecast and run the program to see the output.</span>
                      )}
                    </output>
                    <span className="workshop-caption">Forecasts tested: {tested.length} of {forecasts.length}</span>
                  </div>
                )
              }}
            />
          </div>
        </div>
      </main>
    </>
  )
}
