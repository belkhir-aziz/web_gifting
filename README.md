# Gifty Web Admin

A lightweight web companion for the Gifty app:
- Manage affiliate API keys (Amazon, bol.com) securely
- Add/curate products manually or via future imports
- Fast review queue to like / dislike / superlike products
- Deployable for free on Vercel, with Supabase (free tier) for persistence

## Tech
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- API Routes for server-side logic
- Optional Supabase for Postgres + Auth + Storage

## Getting Started
1. Install deps
```bash
npm install
```
2. Copy env and fill values
```bash
cp .env.example .env
# Fill SUPABASE_* if using DB, set BASIC_AUTH_* for quick protection
# Generate ENCRYPTION_KEY (32 bytes base64), e.g. Node: crypto.randomBytes(32).toString('base64')
```
3. Run dev server
```bash
npm run dev
```

Open http://localhost:5173

## Free Hosting
- Vercel (free) for the web app
- Supabase (free) for database and auth

### Deploy steps (quick)
- Push this folder to a new GitHub repo
- Import the repo in Vercel, set Environment Variables from `.env`
- (Optional) Create a Supabase project and run `supabase.schema.sql` in SQL editor
- Redeploy; `/admin` and `/keys` protected by Basic Auth until you wire proper auth

## Separate Repo
This folder is self-contained. Initialize a new git repo here and push separately:
```bash
git init
git add .
git commit -m "feat: scaffold web admin"
# create new empty repo on GitHub named gifty-web-admin (or your choice)
git remote add origin <your-repo-url>
git push -u origin main
```

## Security Notes
- Never expose affiliate API keys to the browser. They are stored server-side (encrypted) and used via API routes.
- Basic Auth middleware included for quick protection; replace with proper auth (Supabase Auth, NextAuth, Clerk) before inviting collaborators.
 - If using Supabase, store encrypted keys in `api_keys` with server-side service role key only.

## Roadmap
- Amazon and bol.com importers with throttling and retries
- Product de-duplication and categorization helpers
- Rich review UI and keyboard shortcuts
- Role-based auth
