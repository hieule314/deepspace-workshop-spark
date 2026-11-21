import { Link } from 'react-router-dom'
import { Presenter } from '../components/Presenter'
import { Seo } from '../components/Seo'
import { seo } from '../seo'

const activitySteps = [
  {
    prompt: 'Which number would you guess first?',
    instruction: 'A friend picked a secret number from 1 to 31. After each guess, they tell you whether the secret number is higher, lower, or equal. Ask the group to pick a first guess and explain why.',
  },
  {
    prompt: 'You guess 16. Your friend says “higher.”',
    instruction: 'Cross out 1 through 16. The secret is now somewhere from 17 to 31. Ask the group to agree on the next guess before revealing it.',
  },
  {
    prompt: 'Guess 24 next.',
    instruction: '24 splits the remaining numbers into two groups of seven. Picking the middle each time cuts the search space roughly in half. For 31 numbers, this strategy guarantees an answer in at most five guesses.',
  },
] as const

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <main data-testid="static-landing" className="min-h-screen bg-[#f4f6fe] px-5 text-[#1b2440]">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 py-10 sm:py-16">
          <header className="flex items-center justify-between gap-4">
            <span className="text-xl font-bold tracking-tight">Workshop Spark</span>
            <Link to="/home" className="rounded-lg border border-[#b6c2ec] px-3 py-2 text-sm font-semibold text-[#293da6] hover:bg-white">
              Create an activity
            </Link>
          </header>

          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Guess my number</h1>
            <p className="mt-3 text-lg text-[#4f5979]">Binary search · 10 minutes · Beginner</p>
          </div>

          <Presenter steps={activitySteps} buttons={['Try a guess', 'Reveal the next guess', 'Start over']} />
        </div>
      </main>
    </>
  )
}
