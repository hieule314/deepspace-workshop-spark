/**
 * Integration Billing Config
 *
 * Configure who pays for each integration's API calls.
 *
 * - 'developer': The app owner pays (default).
 * - 'user': The calling user pays.
 *
 * The browser proxy only serves configured integrations without `serverOnly`.
 * Server actions default to developer billing for unlisted integrations.
 *
 * IMPORTANT: any integration backed by per-user connected accounts (Google,
 * Composio) must be 'user' — the api-worker resolves the account from the
 * JWT subject. With 'developer' the app owner's JWT is forwarded, so every
 * signed-in user connects and acts on the app owner's account. Server code
 * that acts for a user in the background (e.g. a cron job) uses
 * `callComposio(env, ..., { asUser })` from 'deepspace/worker' instead.
 */

export const integrations: Record<
  string,
  { billing: 'developer' | 'user'; anonymous?: boolean; serverOnly?: boolean }
> = {
  google: { billing: 'user' },
  composio: { billing: 'user' },
  wikipedia: { billing: 'developer', serverOnly: true },
  openai: { billing: 'developer', serverOnly: true },
  youtube: { billing: 'developer', serverOnly: true },
}
