# Workshop Spark

Workshop Spark helps a coding outreach volunteer run a 10-minute activity with a beginner group. Two public samples cover binary search and if/else. Signed-in facilitators can start with a preset computing topic or bring their own topic and teaching notes.

## Try it

1. Select **Try the if/else lesson** on the sample page. Predict what to do on a rainy day, run both forecasts, and compare the blocks with the equivalent JavaScript.
2. Open **Lesson builder**, sign in, and pick a topic or enter your own. Add an age range, an example, or the supplies you have.
3. Select **Generate and save**. Review the steps, materials, diagrams, and available references before presenting.
4. Refresh and reopen the activity from **Saved activities**.

Use **Present** for a large view. Left and right arrow keys move between stages when focus is in the presenter. **Settings** controls appearance and projector text size. Preferences stay in the browser on that device.

## How it works

- A DeepSpace server action looks for a Wikipedia reference, asks OpenAI for a structured activity, and searches YouTube for optional follow-up videos. Lessons can still save when these references are unavailable. Optional diagrams use validated labels and layouts rendered as native HTML.
- DeepSpace Auth identifies the facilitator. A Records collection gives each facilitator access to their own saved lessons.
- The app pays for generation using DeepSpace credits. The worker reserves a slot before any provider call and limits attempts to three per account and twelve across the app per UTC day. The two public samples are prewritten and run entirely in the browser.
- The builder sends teaching notes to OpenAI. Wikipedia and YouTube receive the topic for reference lookup and video search. The public **Data and use** page describes what the app stores and sends.

## Scope

The facilitator leads the exercise from one screen. Learners predict what will happen, test it together, and discuss the result before the reveal. The example JavaScript can go into the online editor a group already uses. Editing a saved draft would be the next addition for facilitators who need to adapt a lesson after generating it.

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
npm run lint
npm run build
npx deepspace test run --port 5183
```
