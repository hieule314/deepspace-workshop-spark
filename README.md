# Workshop Spark

Workshop Spark helps a coding outreach volunteer run a 10-minute activity with a beginner group. The public binary search sample walks through **Predict**, **Try**, and **Reveal**. Signed-in facilitators can generate an activity on binary search, Boolean logic, or RGB color and reopen it from their saved activities.

## Try it

1. Open the sample and click through the three stages.
2. Select **Create an activity**, sign in, and pick a topic.
3. Select **Generate and save**. Review the activity and its reference links.
4. Refresh and reopen the activity from **Saved activities**.

## How it works

- A DeepSpace server action fetches a Wikipedia reference, asks OpenAI for a structured activity, and searches YouTube for optional follow-up videos. Lessons still save when video search is unavailable.
- DeepSpace Auth identifies the facilitator. A Records collection gives each facilitator access to their own saved lessons.
- The app pays for generation using DeepSpace credits. The worker limits attempts to three per account and twelve across the app per UTC day. The public sample uses zero integration calls.

The three preset topics and single facilitator view keep the presenter flow easy to test. Student accounts, live polling, and custom topics are outside this version.

## Run locally

Use Node 24 and npm 11.6 or newer.

```bash
npm ci
npx deepspace auth login
npx deepspace dev start
```

The app uses DeepSpace’s integration proxy. Local CLI credentials and generated `.dev.vars` should stay out of version control.

```bash
npm run validate
npm run build
npx deepspace test run --port 5183
```
