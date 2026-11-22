import { Seo } from '../components/Seo'
import { WorkshopMasthead } from '../components/WorkshopMasthead'
import { seo } from '../seo'

export default function DataAndUsePage() {
  return (
    <>
      <Seo {...seo} path="/data-and-use" title="Data and use | Workshop Spark" description="How Workshop Spark handles activity data and how to use the lesson builder." />
      <WorkshopMasthead />
      <main id="main-content" tabIndex={-1} className="workshop-surface">
        <div className="workshop-shell workshop-shell--settings">
          <header className="workshop-intro workshop-builder-intro">
            <h1>Data and use</h1>
          </header>
          <div className="workshop-settings">
            <section className="workshop-card workshop-data-section" aria-labelledby="privacy-policy">
              <h2 id="privacy-policy" className="workshop-panel-title">Privacy policy</h2>
              <ul>
                <li>DeepSpace handles sign-in. Workshop Spark associates saved activities and daily generation attempts with your account. Each facilitator can open their own saved activities in the app.</li>
                <li>Generating an activity sends the topic and teaching notes to OpenAI, along with a Wikipedia excerpt when available. Wikipedia and YouTube receive the topic for reference lookup.</li>
                <li>Display preferences stay in this browser. You can try the public lessons without signing in.</li>
                <li>For requests about your saved data, contact the app operator through the channel where you received the app link.</li>
              </ul>
              <a className="workshop-link" href="https://deep.space/privacy">DeepSpace privacy policy</a>
            </section>
            <section className="workshop-card workshop-data-section" aria-labelledby="terms-of-use">
              <h2 id="terms-of-use" className="workshop-panel-title">Terms of use</h2>
              <ul>
                <li>Use the builder to prepare educational activities. Enter examples and materials you have permission to share. Keep student names, contact details, and confidential materials out of the builder.</li>
                <li>Review generated steps and references for accuracy and suitability before presenting them.</li>
              </ul>
              <a className="workshop-link" href="https://deep.space/terms">DeepSpace terms</a>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
