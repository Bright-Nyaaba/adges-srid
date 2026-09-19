# ADGES Website

Official website for **ADGES** — the Association of Drilling and Geological Engineering
Students, SRID, University of Mines and Technology (UMaT). Home, About, Leadership,
Gallery, Resources, Student Projects, and a Store with a no-payment order flow — all
backed by a real database, file storage, and an admin CMS built into the site itself.

> **A note on how this project got here:** this site was originally built and iterated on
> as a single-file HTML page inside a Claude.ai Artifact, using Anthropic's built-in
> `db` / `assets` / `user` / `downloads` capabilities as its backend. Those capabilities
> are proprietary to the Claude Artifact runtime and don't exist anywhere else — including
> Google AI Studio, which is a prototyping environment for the Gemini API, not a hosting
> or database platform. This repository is a full rebuild as a standard, portable web
> project (React + Vite + Firebase) that runs anywhere. See
> [`docs/MIGRATION_NOTES.md`](docs/MIGRATION_NOTES.md) for exactly how each original
> capability maps onto what's here, and for the Google AI Studio situation in more detail.

---

## What this project is

A React single-page app (client-side routed, no server-rendering) with:

- **Firestore** as the database — collections for leaders, gallery photos, resources,
  student projects, store products, and orders, plus a single `site/content` document
  for editable page copy (hero headline, About text, etc.)
- **Firebase Storage** for uploaded photos and resource files
- **Firebase Auth** (Google sign-in) for editor identity
- **Cloud Functions** for the one thing that has to run server-side: exporting orders as
  a CSV file, plus admin-allowlist management (`addAdmin` / `removeAdmin`)
- **Firestore & Storage security rules** that enforce "public can read, only allow-listed
  editors can write" — enforced server-side, not just hidden in the UI

There is **no payment integration**, intentionally. The Store lets visitors build a cart
and submit an order request (name, email, phone, notes); ADGES officers see it on the
Orders page and follow up to arrange payment and pickup themselves.

## How it works, page by page

| Page | What a visitor sees | What an editor can additionally do |
|---|---|---|
| **Home** | Hero, quick stats, program highlights, upcoming events, 3 featured projects | Edit the hero headline/lede inline |
| **About** | Mission, vision, history timeline, leadership preview, values | Edit intro/mission/vision text inline |
| **Leadership** | Faculty advisor + full executive committee, with photos | Add/edit/delete leaders, upload photos |
| **Gallery** | Filterable photo grid by category | Add/edit/delete photos, upload images |
| **Resources** | Searchable, categorized downloads | Add/edit/delete resources, upload files |
| **Student Projects** | Filterable project showcase with a detail modal | Add/edit/delete projects, upload a project photo |
| **Store** | Product grid, cart, checkout (no payment) | Add/edit/delete products, upload photos |
| **Orders** *(editors only)* | — | View every submitted order; export as CSV |

Anyone can browse the whole site read-only. The moment someone signs in with Google
**and their email is on the admin allowlist**, the site unlocks: a yellow "Editing" badge
appears, "+ Add" buttons and pencil (✎) icons show up on every card, and inline
"✎ Edit text" buttons appear on the hero/About copy.

## Project structure

```
adges-website/
├── index.html                 Vite entry HTML (fonts, root div)
├── package.json                Frontend dependencies & scripts
├── vite.config.js              Vite/React build config
├── .env.example                Client-side Firebase config template (no real values)
├── firebase.json               Firebase project config (hosting, firestore, storage, functions)
├── firestore.rules             Firestore security rules (source of truth for access control)
├── firestore.indexes.json      Firestore composite index definitions (none needed yet)
├── storage.rules               Firebase Storage security rules
├── src/
│   ├── main.jsx                 React root
│   ├── App.jsx                  Routing, live data subscriptions, cart state
│   ├── firebase.js              Firebase SDK init (reads config from env vars)
│   ├── styles.css                All site styling (ported from the original design)
│   ├── lib/
│   │   ├── auth.js               Google sign-in + useAuth() / isEditor hook
│   │   ├── db.js                 Firestore CRUD + subscription helpers
│   │   ├── storage.js            File upload/delete helpers
│   │   └── seed.js               First-run seeding of default content
│   ├── data/
│   │   ├── defaults.js           Placeholder/seed content for every collection
│   │   └── icons.js              Inline SVG icon set + gallery placeholder generator
│   └── components/
│       ├── Nav.jsx, Modal.jsx, EditableText.jsx, ProjectCard.jsx, ProjectModal.jsx
│       ├── Home.jsx, About.jsx, Leadership.jsx, Gallery.jsx, Resources.jsx,
│       │   Projects.jsx, Store.jsx, Orders.jsx
│       └── CartDrawer.jsx
├── functions/                  Cloud Functions ("API routes")
│   ├── package.json
│   ├── index.js                 exportOrdersCsv, addAdmin, removeAdmin, onOrderCreated
│   └── .env.example
└── docs/
    └── MIGRATION_NOTES.md       Claude Artifact → Firebase capability mapping
```

## Data model (Firestore)

```
leaders/{id}      { name, position, level, photoUrl, photoPath, bg, order }
gallery/{id}      { title, cat, photoUrl, photoPath, order }
projects/{id}     { cat, icon, title, team, year, desc, tags[], photoUrl, photoPath, order }
resources/{id}    { category, code, title, meta, fileUrl, filePath }
store/{id}        { title, priceNum, icon, bg, photoUrl, photoPath, order }
orders/{id}       { items[{title,price,qty}], total, name, email, phone, notes, status, createdAt }
site/content      { 'hero.headline', 'hero.lede', 'about.intro', 'about.mission', 'about.vision' }
meta/admins       { emails: string[] }   ← never client-writable; managed via Cloud Functions
```

`photoUrl`/`fileUrl` are public Firebase Storage download URLs (used directly as `<img src>`
or download links). `photoPath`/`filePath` are the Storage paths, kept so the app can delete
the old file when it's replaced.

## Setup

### 1. Prerequisites
- Node.js ≥ 18
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com)) with
  **Firestore**, **Storage**, and **Authentication → Google sign-in** enabled
- The [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

### 2. Install
```bash
npm install
cd functions && npm install && cd ..
```

### 3. Configure environment
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your Firebase project's web app config (Firebase Console →
Project settings → General → "Your apps" → SDK setup and config). These are public
client-side values — the actual security boundary is `firestore.rules`/`storage.rules`,
not these keys. See `.env.example` for what each one is.

### 4. Deploy security rules
```bash
firebase login
firebase use --add            # pick your Firebase project
firebase deploy --only firestore:rules,storage:rules
```

### 5. First admin (bootstrapping editor access)
The `addAdmin` Cloud Function requires an *existing* admin to grant access to anyone else
— so the very first admin has to be added manually:

1. Sign in to the site once with Google (top-right "Editor sign-in") so a Firebase Auth
   user exists for your email.
2. In the Firebase Console → Firestore Database, create a document at path
   `meta/admins` with a single field: `emails` (array) containing your email address,
   e.g. `["you@example.com"]`.
3. Reload the site — you're now an editor. From here on, use the Orders page or a quick
   call to the `addAdmin` callable function to add more editors.

### 6. Run locally
```bash
npm run dev
```
Visit the printed local URL. For a fully offline dev loop (no real Firebase project
needed), use the emulator suite instead: `npm run emulators` in one terminal and
`npm run dev` in another — `src/firebase.js` would need `connectFirestoreEmulator`/
`connectStorageEmulator`/`connectAuthEmulator` calls added for that (not wired in by
default, to keep the common case — pointing at a real project — simple).

### 7. Deploy
```bash
npm run build
firebase deploy
```
This deploys hosting (the built frontend), Firestore rules, Storage rules, and Cloud
Functions together. After it finishes, copy the printed Functions base URL into
`VITE_FUNCTIONS_BASE_URL` in `.env.local` (needed for the Orders page's CSV export),
then rebuild and redeploy hosting: `npm run build && firebase deploy --only hosting`.

## The Cloud Functions ("API routes")

| Function | Type | Purpose |
|---|---|---|
| `exportOrdersCsv` | HTTPS request | Returns all orders as a downloadable CSV. Requires `Authorization: Bearer <admin ID token>`. |
| `addAdmin` | Callable | Lets an existing editor grant editor access to another email. |
| `removeAdmin` | Callable | Lets an existing editor revoke another editor's access. |
| `onOrderCreated` | Firestore trigger | Fires when a new order is placed; currently just logs it — the natural place to add an email/Slack notification. |

## Known limitations

- **File types**: Storage rules accept images, PDF, and plain-text/JSON uploads (~20 MB
  cap). Word, PowerPoint, and ZIP files aren't accepted by default — widen the
  `contentType.matches(...)` pattern in `storage.rules` if you need them.
- **No payment processing** — by design. Orders are requests only.
- **Emulator wiring** isn't pre-connected in `src/firebase.js` — add the `connect*Emulator`
  calls there if you want local dev fully offline from real Firebase.

## About Google AI Studio

Google AI Studio is where you'd prototype **Gemini API** features — for example, an
"AI-suggest a project summary" button, or a chatbot answering questions about ADGES using
site content as context. It isn't a place to host this site or store its data. If you want
to add a Gemini-powered feature:

1. Prototype the prompt/behavior in Google AI Studio.
2. Get a Gemini API key.
3. Put it in `functions/.env` as `GEMINI_API_KEY` (never in frontend code/env — it must
   stay server-side).
4. Add a new Cloud Function in `functions/index.js` that calls the Gemini API and returns
   the result; call that function from the frontend the same way `Orders.jsx` calls
   `exportOrdersCsv`.

More detail, plus the full mapping of the original Claude Artifact capabilities to what
this project uses instead, is in [`docs/MIGRATION_NOTES.md`](docs/MIGRATION_NOTES.md).
