import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

export function WorkshopMasthead({ account, testId }: { account?: ReactNode; testId?: string }) {
  return (
    <header className="workshop-masthead">
      <a href="#main-content" className="workshop-skip-link">Skip to main content</a>
      <nav className="workshop-masthead-inner" aria-label="Workshop navigation" data-testid={testId}>
        <Link to="/" className="workshop-wordmark">
          <img className="workshop-wordmark-mark" src="/workshop-spark-icon.png" alt="" width={32} height={32} />
          Workshop Spark
        </Link>
        <NavLink to="/" end className="workshop-nav-link workshop-masthead-sample">
          Sample lesson
        </NavLink>
        <div className="workshop-masthead-actions">
          <NavLink to="/home" className="workshop-nav-link">
            Lesson builder
          </NavLink>
          <NavLink to="/settings" className="workshop-settings-link" aria-label="Settings" title="Settings">
            <Settings size={18} aria-hidden="true" />
          </NavLink>
          {account}
        </div>
      </nav>
    </header>
  )
}
