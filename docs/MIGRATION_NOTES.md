# Migration Notes: Claude Artifact → this project

This document explains exactly what changed when this site moved off the Claude.ai
Artifact runtime, why a literal "migrate to Google AI Studio" wasn't possible, and what
replaced each original capability.

## Why not Google AI Studio directly

Google AI Studio is a prototyping console for the **Gemini API** — you write prompts,
test model behavior, and can export small "Build" apps that call Gemini. It does not
provide:

- A database
- File/object storage
- User authentication
- Hosting for a multi-page app with server-side access control

Those are exactly the four things this site's backend needed (they're what Claude's
`db`, `assets`, `user`, and `downloads` Artifact capabilities provided). So "migrating to
Google AI Studio" in the sense of *moving the backend there* isn't something that
platform does. What AI Studio *is* good for, if you want it: prototyping a Gemini-powered
feature (see "Adding Gemini features" below) before wiring it into this project's
existing Cloud Functions.

## Capability mapping

| Claude Artifact capability | What it did here | Replaced by |
|---|---|---|
| `db` (`window.claude.use('db')`) | Collections for leaders/gallery/resources/projects/store/orders, `site/content` doc, live `onSnapshot` subscriptions | **Firestore** — `src/lib/db.js` wraps `collection`/`doc`/`onSnapshot` from the Firebase SDK. The API shape is almost identical by design. |
| `assets` (`window.claude.use('assets')`) | `ASSETS.upload(file)` → returns a stable file ID, rendered via `/_blob/<id>` | **Firebase Storage** — `src/lib/storage.js`'s `uploadFile()` returns a `{ path, url }`; `url` is used directly as `<img src>` or a download link, `path` is kept so the old file can be deleted on replace. |
| `user` (`window.claude.use('user')`) | `USERCAP.canEdit()` — the platform already knew who owned the artifact | **Firebase Authentication (Google sign-in) + a Firestore allowlist** at `meta/admins`. There's no platform-level "you own this" concept outside claude.ai, so real sign-in plus an explicit allowlist is the closest honest equivalent. See `src/lib/auth.js`. |
| `downloads` (`window.claude.use('downloads')`) | `DOWNLOADSCAP.save({filename, data})` — client-side triggered file download, used for the Orders CSV export | **A Cloud Function** (`functions/index.js` → `exportOrdersCsv`), since generating the CSV needs privileged server-side access to the full `orders` collection (which is read-locked to admins). The frontend calls it, gets a CSV blob back, and triggers the download itself. |
| Artifact publishing / hosting | The page itself, hosted at a claude.ai link | **Firebase Hosting**, via `firebase deploy --only hosting` serving the Vite build output (`dist/`). |
| Implicit "same artifact = same data" scoping | All data lived under this one artifact | **A Firebase project** is the equivalent unit — one Firestore database, one Storage bucket, scoped by your Firebase project ID. |

## What's structurally different (not just renamed)

- **Real sign-in is now required for editing.** The Claude Artifact runtime could tell
  the page "the current viewer owns this artifact" without any explicit login. Outside
  that runtime, there's no such signal — so editors now sign in with Google, and access
  is checked against an explicit allowlist enforced by `firestore.rules`/`storage.rules`,
  not just hidden UI. This is arguably *more* secure than the original (rules are
  enforced server-side no matter what the client does), but it does mean editors need to
  sign in once and be added to the allowlist (see the README's "First admin" section).
- **File type restrictions moved, and loosened.** The Artifact `assets` capability only
  accepted a fixed list of types (images, PDF, a handful of text formats) — Word,
  PowerPoint, and ZIP were never possible. Firebase Storage can technically store any
  file type; `storage.rules` currently keeps the same narrow allowlist as a sensible
  default, but you can widen the `contentType.matches(...)` pattern there if you want to
  host other formats.
- **CSV export needed a real server-side function.** The Artifact `downloads` capability
  ran client-side with direct access to the (client-visible) orders array. Since orders
  are now read-restricted to admins at the database level, generating the CSV had to move
  server-side into a Cloud Function that verifies the caller's identity itself.
- **Seeding is now explicit and idempotent**, in `src/lib/seed.js` — it checks whether
  each collection is empty before writing defaults, so it's safe to run every time an
  editor loads the site (rather than a one-shot "first artifact load" event).

## Adding Gemini features later (optional)

If you want to use Google AI Studio for what it's actually for — prototyping a
Gemini-powered feature — the integration point is a new Cloud Function, following the
same pattern as `exportOrdersCsv`:

1. In AI Studio, prototype the prompt (e.g. "summarize this student project description
   in one sentence for a homepage teaser").
2. Get a Gemini API key from AI Studio / Google AI for Developers.
3. Put the key in `functions/.env` as `GEMINI_API_KEY` (already scaffolded in
   `functions/.env.example`) — **never** put it in frontend `.env.local`, since anything
   `VITE_`-prefixed ships in the built JavaScript bundle and is publicly visible.
4. Add a function in `functions/index.js`, e.g.:
   ```js
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   exports.summarizeProject = onCall(async (request) => {
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
     const result = await model.generateContent(`Summarize in one sentence: ${request.data.desc}`);
     return { summary: result.response.text() };
   });
   ```
   (Add `@google/generative-ai` to `functions/package.json` dependencies.)
5. Call it from the frontend with the Firebase SDK's `httpsCallable`, the same way you'd
   call `addAdmin`.

That keeps the API key server-side, reuses the existing auth/admin-check pattern, and
keeps the Gemini call in one clearly-labeled place.
