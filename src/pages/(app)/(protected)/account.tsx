import { signOut, useUser } from 'deepspace'

export default function AccountPage() {
  const { user } = useUser()

  return (
    <div className="workshop-surface">
      <div className="workshop-shell workshop-shell--settings">
        <header className="workshop-intro workshop-builder-intro">
          <h1>Account</h1>
        </header>
        <section className="workshop-card workshop-resources" aria-labelledby="account-heading">
          <h2 id="account-heading" className="workshop-panel-title">Your account</h2>
          <div>
            <p>{user?.name ?? 'Signed in'}</p>
            <p className="workshop-caption">{user?.email}</p>
          </div>
          <div>
            <button type="button" className="workshop-secondary" onClick={() => signOut()}>Sign out</button>
          </div>
        </section>
      </div>
    </div>
  )
}
