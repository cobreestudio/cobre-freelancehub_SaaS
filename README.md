# Cobre — Invoice Management for Freelancers

Cobre is a clean, production-ready SaaS for freelancers to manage clients, projects, and invoices from a single place. Built with Next.js 16, Supabase, and Tailwind CSS.

## Features

- **Clients** — full CRUD, notes, status (active/inactive), avatar initials with consistent colors
- **Projects** — budget tracking, progress bar vs invoiced amount, status workflow
- **Invoices** — auto-numbered (FAC-YYYY-NNN), PDF generation, inline status changes, inline edit (amount & due date), overdue auto-detection
- **Dashboard** — revenue bar chart, project status donut, monthly comparison, business health indicator, onboarding banner
- **Profile** — fiscal data (name, NIF/CIF, address) + payment info (IBAN/Bizum) printed on PDFs
- **PDF export** — full invoice PDF with fiscal data and payment details via jsPDF
- **Automated reminders** — daily cron job sends payment reminder emails to clients with overdue invoices (Resend + Vercel Cron), with a 7-day deduplication window
- **PWA** — installable on Android/iOS, service worker for offline caching
- **i18n** — Spanish, English, French (next-intl v4)
- **Auth** — Supabase Auth with Row Level Security (each user only sees their own data)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS v4 |
| i18n | next-intl v4 |
| PDF | jsPDF |
| Email | Resend |
| Charts | Recharts |
| Deploy | Vercel (Hobby plan compatible) |

## Setup

### 1. Clone & install

```bash
git clone https://github.com/anibormar11-cyber/freelancehub.git
cd freelancehub
npm install
```

### 2. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 3. Resend (optional — for automated email reminders)

1. Create an account at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain (or use `onboarding@resend.dev` for testing)

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
CRON_SECRET=your-random-secret
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy — Vercel will automatically pick up `vercel.json` and schedule the daily cron job

> **Note:** The automated reminder cron (`/api/send-reminders`) requires Vercel's cron feature, available on the Hobby plan and above.

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (app)/          # Authenticated pages
│   │   │   ├── page.tsx    # Dashboard
│   │   │   ├── clients/
│   │   │   ├── projects/
│   │   │   ├── invoices/
│   │   │   └── profile/
│   │   ├── (public)/       # Auth pages (login, register)
│   │   └── landing/        # Public landing page
│   └── api/
│       └── send-reminders/ # Cron endpoint
├── components/             # Sidebar, Toast
├── hooks/                  # useToast
└── lib/
    ├── store.ts            # All Supabase data access
    ├── types.ts            # TypeScript interfaces
    ├── pdf.ts              # Invoice PDF generator
    └── supabase.ts         # Supabase client
messages/                   # i18n translation files (es, en, fr)
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── icons/
schema.sql                  # Full database schema with RLS policies
```

## Customisation

- **Branding** — search for "Cobre" across the codebase to rename the app
- **Currency** — currently hardcoded to `€`; search for `€` and `es-ES` to change locale
- **IVA rate** — the 21% IVA calculation in `invoices/page.tsx` and `pdf.ts` can be made configurable
- **Languages** — add new locales by creating a file in `messages/` and updating `src/i18n/routing.ts`

## License

MIT — see [LICENSE](LICENSE).
