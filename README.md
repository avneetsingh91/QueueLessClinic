# Queueless — Live Clinic & OPD Token Tracker

Queueless is a production-minded, multi-tenant QR queue manager for clinics, independent doctors,
diagnostic labs, and hospital OPDs. Patients scan a QR code and track their token in real time
without installing an app or creating an account. Staff manage the queue from a protected,
role-aware dashboard.

Firebase (Authentication + Cloud Firestore + Hosting) is the real backend. There is no mock data
layer.

---

## Features implemented

### Patient experience (`/queue/:slug`)
- No login or registration; token number only.
- Live updates via Firestore `onSnapshot` on a sanitized public queue document.
- Clinic name, doctor/department, currently serving token, your token, people ahead, estimated
  wait range, and status.
- Prominent "Your turn is approaching!" alert when 2 or fewer tokens remain.
- Announcements (breaks, delays, emergencies) and queue status messages (open / paused / closed).
- Token remembered per browser session; change token at any time.
- Loading skeletons, unavailable-clinic error state, mobile-first responsive design.
- **Privacy:** the public document contains only token numbers and statuses. No names, phone
  numbers, or medical data are ever written to it.

### Staff dashboard (`/dashboard`)
- Firebase email/password auth, protected routes, and admin/receptionist roles.
- Overview KPIs: currently serving, total tokens, waiting, completed, rolling average consultation.
- Live queue table with Next, Skip, Complete, Recall, Mark Absent, Reset, and **Undo last action**.
- Confirmation dialog before daily queue reset.
- Queue status control (Open / Paused / Closed).
- Announcement broadcaster with presets and custom text, live on the patient page.
- Manual token issue (1–5 at a time) and token search.
- Doctors/departments management and selection of the doctor shown publicly.
- Analytics with Recharts (token volume by hour + status split) and an audit activity feed.
- Settings for clinic profile, fallback consultation duration, staff roles, QR code, and public link.
- QR code: view, download PNG, print, and copy public queue link.

### Queue engine (`src/services/queueService.js`)
- Deterministic daily queue document (`queues/{clinicId}_{YYYY-MM-DD}`).
- Sequential token numbering per clinic per day (reset at 001 for a new day / reset action).
- All critical operations run inside Firestore **transactions** on the queue document, so
  concurrent receptionists cannot create duplicate active tokens or race on numbering.
- Only one token is `SERVING` at a time; skipped tokens are never active and can be recalled.
- Recalled tokens are prioritized by an `isRecalled` flag in the queue's token summaries.
- Rolling average consultation time from the last 10 completed consultations with a configurable
  fallback (default 8 minutes). Wait estimates are shown as a range.
- Every staff action writes an immutable audit event (`queueEvents`) with an undo snapshot.
- A `publicQueues/{slug}` mirror is updated transactionally so patient reads are cheap and safe.

---

## Project structure

```
.
├── src/
│   ├── components/
│   │   ├── common/        # Button, Card, Badge, Modal, Feedback, States, ErrorBoundary
│   │   ├── dashboard/     # KPIs, queue controls/table, announcements, QR, activity, modals
│   │   ├── layout/        # Navbar, Footer, Logo, AuthShell, DashboardLayout
│   │   ├── queue/         # Patient token entry + public queue card
│   │   └── ui/            # (reserved for future design-system primitives)
│   ├── context/           # AuthContext, QueueContext
│   ├── hooks/             # useAuth, useQueue, usePublicQueue
│   ├── pages/             # Landing, Queue, Login, Register and all dashboard pages
│   ├── routes/            # ProtectedRoute (with adminOnly option)
│   ├── services/          # firebase, authService, clinicService, queueService
│   ├── styles/            # (reserved; global theme lives in src/index.css)
│   ├── utils/             # constants, queueHelpers, timeEstimator, formatters
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
└── README.md
```

---

## Installation

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Fill in the `.env` values from your Firebase web app (see below), then:

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

---

## Firebase setup

1. Create a Firebase project at the Firebase console.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database (production mode). Choose a region near your users.
4. Project settings → Your apps → Web app → register the app and copy the config values.
5. Put those values into `.env`:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Optional: `VITE_PUBLIC_QUEUE_BASE_URL=https://queueless.app` if QR codes should point to a
   custom domain instead of the current origin.

   These are public web identifiers, not secrets. Access control lives in `firestore.rules`.

6. Install Firebase CLI and log in:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add     # select the project you created
   ```

7. Deploy rules and indexes:

   ```bash
   npm run firebase:rules
   npm run firebase:indexes
   ```

   Alternatively run `firebase emulators:start` after configuring emulators in `firebase.json`
   to test locally. The app uses the standard SDK, so point the config at emulator hosts if needed.

8. Register your clinic at `/register`. The registration transaction creates the clinic, admin
   user profile, today's queue, public queue document, and audit event atomically.

9. (Optional for public links) Add your production domain under Authentication → Settings →
   Authorized domains.

### Firestore collections

```
clinics/{clinicId}                     clinic profile, slug, owner, defaults
users/{userId}                         name, email, role, clinicId
queues/{queueId}                       daily queue state, current token, summaries, announcement
queues/{queueId}/tokens/{tokenId}      token number, status, timestamps (no PII)
queueEvents/{eventId}                  audit trail + undo snapshots
publicQueues/{slug}                    PUBLIC read-only mirror (token numbers/statuses only)
doctors/{doctorId}                     private staff directory
```

Composite indexes for the list queries are declared in `firestore.indexes.json`.

### Security model

- Unauthenticated users can read **only** `publicQueues/{slug}`.
- Staff rules resolve the signed-in user's `users/{uid}` document and enforce
  `clinicId` isolation on every read/write.
- Admin-only writes: clinic settings, doctor records, staff role changes.
- Queue writes validate clinic ownership, document shape, and allowed status values.
- Audit events may only be created with `performedBy == auth.uid`; only the `undone` fields are
  mutable afterwards.
- Race safety is enforced in transactional client logic; Firestore rules plus the transaction
  prevent cross-clinic tampering.

---

## Local development workflow

1. Register a clinic → note `/queue/<your-slug>`.
2. Open the public queue URL in a private/incognito window.
3. In the dashboard, issue a token and watch the patient page update instantly.
4. Call next token, skip, recall, mark absent, and try undo.
5. Publish an announcement and confirm it appears on the patient page.
6. Pause and close the queue to verify patient messaging.
7. Download/print the QR code from Settings, Token Management, or Overview.

---

## Deployment

```bash
npm run build
firebase use --add        # first time only
npm run deploy           # builds, then deploys hosting + firestore rules/indexes
```

`firebase.json` configures SPA rewrites so `/queue/:slug` and all dashboard routes work on refresh,
plus cache headers (no-cache for `index.html`, long-lived for hashed assets).

If you use a custom domain, set `VITE_PUBLIC_QUEUE_BASE_URL` before building so generated QR codes
use that domain.

---

## Limitations / notes

- Queue mutations use client-side Firestore transactions, which are concurrency-safe for the
  documented operations. Porting them to Callable Cloud Functions would add server-side
  authorization and even stronger validation; the current rules still enforce tenant isolation.
- Firestore rules cannot inspect the contents of each element in the `tokenSummaries` list, so
  staff with write access are trusted not to inject arbitrary strings there. Staff accounts are
  created only through the registration/admin flow and are clinic-scoped.
- Resetting a queue with more than 400 tokens splits token updates into a batch plus a queue
  transaction; extremely large single-day queues should be moved to a Cloud Function.
- Analytics are computed from the current day's token documents (capped at 400 in the live view);
  historical reporting would benefit from a dedicated rollup collection.
- No automated test suite is included in this MVP. Verify the manual workflow above after setup.
- Firebase credentials are intentionally not committed. Without `.env`, the app renders with a
  clear setup notice instead of fake data.
