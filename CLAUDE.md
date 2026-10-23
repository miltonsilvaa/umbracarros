# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b (type-check via project references) then vite build
npm run preview   # preview the production build
npm run lint       # oxlint
```

There is no test runner configured. There is no single-file/single-test command since no test
framework is set up.

Environment variables (Vite, must be prefixed `VITE_`) live in `.env`, not committed. Copy
`.env.example` and fill in a Firebase web app's config values. Without them, `firebase.ts`
initializes with empty strings and auth/Firestore/Storage calls fail at runtime (the app still
boots and type-checks).

## Architecture

React (Vite) + TypeScript SPA backed directly by Firebase client SDK (Auth, Firestore, Storage) —
there is no custom backend/API layer. All data access happens from components/pages via the
Firebase JS SDK.

- `src/services/firebaseConnection.ts` — the one place `initializeApp` is called; exports `auth`,
  `db`, `storage`. Every other file imports from here rather than touching `firebase/app` directly.
- `src/contexts/AuthContext.tsx` + `src/hooks/useAuth.ts` — the only source of auth state
  (`signed`, `loadingAuth`, `user`) and the only place `signInWithEmailAndPassword`,
  `createUserWithEmailAndPassword`, and `signOut` are called. `main.tsx` wraps `<App />` in
  `AuthProvider`; pages read auth state through `useAuth()`, never `firebase/auth` directly.
- `src/routes/Private.tsx` — gate for authenticated-only routes; wraps `<Dashboard />` and `<New />`
  in `App.tsx`'s route table. Redirects to `/login` once `loadingAuth` resolves false and
  `signed` is false.
- `src/types/car.ts` — the `CarProps` shape mirrors the Firestore `cars` collection schema
  exactly (`id`, `name`, `brand`, `model`, `year`, `km`, `price`, `city`, `whatsapp`,
  `description`, `created`, `ownerId`, `ownerName`, `ownerEmail`, `images: {name, url}[]`).
  Any change to a car document's fields should update this type first — every page that reads
  `cars` casts Firestore snapshot data to it.
- Firebase Storage paths follow `images/{ownerId}/{imageName}` — `imageName` is a
  `crypto.randomUUID()` generated client-side in `src/pages/dashboard/new/index.tsx`, reused as
  both the Storage object name and the `images[].name` field so deletion (in `Dashboard` and in
  `New`'s remove-before-save flow) can reconstruct the Storage ref from Firestore data alone.
- Pages live under `src/pages/<name>/index.tsx` (plus `src/pages/dashboard/new/index.tsx` for the
  nested create-ad route) and are wired into the route table in `src/App.tsx`. There's no router
  config file beyond that — routes, including which ones are wrapped in `<Private>`, are defined
  inline in `App.tsx`.
- `src/components/Input/index.tsx` is a generic wrapper around `react-hook-form`'s `register`
  (`Input<T extends FieldValues>`), used by every form instead of raw `<input>` + `register()`.
  Each form defines its own Zod schema colocated in the page file and derives its type with
  `z.infer`.
- Home page search (`src/pages/home/index.tsx`) is client-side filtering over an already-fetched
  page of cars (`allCars`), not a Firestore query — "load more" (`startAfter` pagination) is
  disabled while a search term is active, since it only paginates the unfiltered set.
- Image upload in `New` uploads each file to Storage immediately on drop/select (before form
  submit), tracking per-image upload state in `uploadingIds`; removing a preview image before
  submitting also deletes it from Storage right away. The Firestore `cars` doc is only created on
  form submit, referencing the already-uploaded image URLs.
- Deleting a car (`src/pages/dashboard/index.tsx`) deletes Storage files *before* the Firestore
  doc, deliberately — if the doc were removed first and a Storage delete then failed, the
  orphaned files would have no surviving doc pointing at them to retry cleanup from.
- `CarProps.created` is typed `Timestamp | null` (from `firebase/firestore`), not `string` —
  it's written with `serverTimestamp()` in `New`, which resolves to `null` in a local cache
  before the server acknowledges it. No page currently renders `created`, and every read in this
  app is a one-shot `getDocs()` (never `onSnapshot`), so the `null` case isn't expected to
  surface in practice while online — the type is kept nullable anyway since it reflects what the
  SDK can actually return, not because any code guards against it today. Ordering by `created`
  (`orderBy('created', 'desc')` in `Home`) happens server-side in the Firestore query itself —
  there is no client-side `.sort()` on car lists anywhere in this codebase.
- Firestore/Storage access control lives in `firestore.rules` / `storage.rules` at the repo root
  (not yet deployed — deploy with the Firebase CLI before going to production). They gate on the
  same `ownerId` field `CarProps` uses, and on the real Storage path
  `images/{uid}/{fileName}` (no `carId` segment — one flat folder per user, matching
  `New`/`Dashboard`, not a `cars/{uid}/{carId}/...` nesting).
- There is still no `users` collection. `src/pages/vendor/index.tsx` (public route
  `/vendedor/:id`) shows a seller's profile by querying `cars` for `ownerId == id` and reading
  `ownerName`/`ownerEmail` off whichever car comes back first — it does not read a user profile
  doc, because there isn't one. A seller with zero active ads has no data source for their own
  name, so the page falls back to a "no active listings" state instead of a profile.
- `Vendor`'s query (`where('ownerId', '==', id)` + `orderBy('created', 'desc')`) is an
  equality-filter-plus-orderBy-on-a-different-field query, which Firestore does **not** cover
  with its automatic single-field indexes — it needs a composite index. The first time this
  query runs against a real project, Firestore throws `failed-precondition` with a console link
  that creates the exact index needed; click it (or add the index manually: collection `cars`,
  fields `ownerId` Ascending + `created` Descending). This is expected on first run, not a bug.
- `src/components/CarCard/index.tsx` is the shared car-grid card (image, name, year/km, price,
  city, links to `/car/:id`) — used by `Home`, `Vendor`, and `Favorites`. `Dashboard`'s card is
  *not* this component: it needs the edit/delete buttons instead of a `Link` wrapper, so it
  stays separate rather than forcing an action-slot prop onto `CarCard` for one caller.
- Favorites: `favorites` is a flat top-level collection, not a `users/{uid}/favorites`
  subcollection (there's no `users` doc to nest under). Each doc's ID is the deterministic
  `{uid}_{carId}` (not auto-generated) — see `src/contexts/FavoritesContext.tsx` — so
  favoriting/unfavoriting is a `setDoc`/`deleteDoc` by known ID, never a query, and the same
  car can't be double-favorited by the same user. `FavoritesProvider` wraps `<App />` inside
  `AuthProvider` in `main.tsx` and loads the *entire* set of the signed-in user's favorite
  `carId`s once (one query) into a `Set<string>` kept in context — `CarCard` and `CarDetail`
  call `isFavorite(carId)` against that in-memory set rather than each doing their own
  Firestore read, which matters once a grid has more than a couple of cards. `firestore.rules`
  mirrors this: `create` requires both `uid == auth.uid` *and* the doc ID to actually equal
  `{auth.uid}_{carId}`, so a client can't write a `favorites` doc under a mismatched ID.
  `src/pages/dashboard/favorites/index.tsx` resolves each favorited `carId` with an individual
  `getDoc` (not denormalized car data in the favorite doc — the car's current price/image stays
  authoritative instead of drifting). If a favorited car was deleted, that `getDoc` comes back
  non-existent; the page opportunistically calls `toggleFavorite` on it to delete the now-orphaned
  `favorites` doc instead of leaving it to accumulate.
