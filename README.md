# klova — photography studio

Editorial black-and-white photography portfolio (a pixel-perfect React build of
the Claude Design handoff) **+ an admin panel** that manages every piece of
content and all photos, backed by **Supabase** (Postgres + Storage + Auth).

- **Public site** — `/`
- **Admin panel** — `/admin`

The public catalogue, hero, story, services, footer, ticker and theme are all
editable from the admin panel. Until you upload real photos, deterministic
`picsum.photos` placeholders are shown (exactly like the original design), so
the site never looks empty.

---

## 1. Install

```bash
npm install
```

## 2. Create a Supabase project

1. Go to <https://supabase.com> → **New project**. Pick a name and password.
2. When it is ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Create the database schema

In the Supabase dashboard → **SQL Editor → New query**, paste the entire
contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

This creates the `categories`, `works`, `services`, `site_settings` tables,
Row Level Security policies (public can read; only signed-in admins can write),
the public **`works` Storage bucket**, and seeds the catalogue with the original
design data.

## 5. Create your admin user

Supabase dashboard → **Authentication → Users → Add user**:

- Enter an email + password and **tick "Auto Confirm User"**.

That email/password is your admin login at `/admin`. (Add more users any time;
all authenticated users have full admin access via RLS.)

> Optional: under **Authentication → Providers → Email**, turn **off**
> "Allow new users to sign up" so only users you create can sign in.

## 6. Run

```bash
npm run dev
```

- Site: <http://localhost:5173/>
- Admin: <http://localhost:5173/admin>

Production build:

```bash
npm run build && npm run preview
```

---

## Admin panel

| Section | What you control |
|---|---|
| **Dashboard** | Counts + quick links |
| **Works & Photos** | Create/edit/delete works, **upload photos** to Storage, set category, year, location, masonry dimensions, sort order, publish/hide |
| **Categories** | Add/rename/reorder/delete catalogue categories |
| **Services** | The three (or more) services blocks |
| **Site Content** | Nav, hero (text + image), catalogue header, ticker, story/about (text, stats, image), footer columns & links, lightbox copy |
| **Theme** | Default grid layout, gap, type pairing, tone/mood, ticker & corner-number toggles (saved globally) |

Photos are uploaded to the public `works` Storage bucket. A work with no
uploaded photo falls back to a `picsum` placeholder keyed by its `seed` field,
so the design always reads as a real photo site.

## Notes

- **Routing** uses the HTML5 history API. For production hosting, add a SPA
  rewrite so `/admin/*` serves `index.html` (Netlify `_redirects`:
  `/*  /index.html  200`; Vercel: framework preset "Vite" handles this).
- The original Claude Design **Tweaks panel** (a design-time tool) is replaced
  by the admin **Theme** page — the same layout / type / tone controls, now
  persisted to the database as the site-wide default.
- `styles.css` is ported verbatim from the design and should not be restyled;
  admin-only styling lives in `admin.css`.

## Project structure

```
index.html
supabase/schema.sql        ← run this in Supabase
src/
  main.jsx                 ← routes: / (public) and /admin
  lib/
    supabase.js            ← client + image URL resolver
    defaults.js            ← canonical content shape & design defaults
    useSiteData.js         ← public data fetch + theme CSS vars
  styles/
    styles.css             ← design CSS (verbatim — do not edit)
    admin.css              ← admin UI styles
  site/PublicSite.jsx      ← pixel-perfect portfolio
  admin/
    AdminApp.jsx, auth.js, Login.jsx, ui.jsx, useSettings.js
    pages/ Dashboard, Works, Categories, Services, Content, Theme
```
