Admin Organization Dashboard

Production-minded admin dashboard for creating organizations, inviting members, and managing org directories. Built with React 18 + TypeScript, Vite (SWC), Supabase, TanStack Query, React Hook Form + Zod, Tailwind CSS, and shadcn/ui.

Live Deployments

Environment

Branch

URL

Production

main

https://truthos-admin-dashboard.vercel.app

Development

development

https://truthos-admin-dashboard-saadanashraf86-9076s-projects.vercel.app

Seeded Test Credentials

Use these pre-configured administrator credentials to bypass registration and access the fully populated live environments instantly:

Field

Value

Role

System Administrator

Email

admin@example.com

Password

Admin123!

Note: This user exists in Supabase Auth and has been granted full platform schema permissions via the public.promote_user_to_admin('admin@example.com') pipeline execution script.

Core Features

Admin Authentication — Secure email/password sign-in boundaries; non-admin tokens are intercepted and blocked via a global layout wrapper. Sign-up requires an advanced client-safe registration secret validated via the promote-to-admin Deno Edge Function.

Organization Creation Engine — Intuitive form architecture that lets administrators create School, Nonprofit, or Business entities with type-specific validation rules (e.g., matching strict tax identification formatting depending on entity classification).

Member Invitations — Fully isolated server-side invite-member Edge Function that validates emails, verifies caller tenant ownership via authenticated token payloads, and automatically prevents duplicate pending records.

Dynamic Organization Directory — A real-time data table listing created organizations complete with type contextual badges, live member counters, and formatting dates driven by server-state invalidations.

Row-Level Security (RLS) — Multi-tenant sandboxing running explicitly across every Postgres relation. Administrators are structurally restricted from intercepting cross-tenant operational data.

Dark Mode Integration — Fully integrated structural theme context driving native system tokens using next-themes seamlessly across custom components.

Branching Strategy

The repository structure leverages a professional, multi-branch continuous deployment schema:

main          ← Production branch track (Auto-deploys to Vercel Production)
development   ← Default development track (Auto-deploys to Vercel Preview/Canonical URL)
feat/* ← Short-lived branch streams → Merged via formal Pull Requests into development


When a development milestone reaches stability, a deployment synchronization release is executed directly from development → main to push changes to the live edge nodes.

Quick Start (Local Development)

Follow these instructions to clone, install, configure, and boot up your isolated local development client runtime in under 15 minutes.

1. Clone and Install Dependencies

git clone [https://github.com/Saadan-not-a-coder/-truthos-admin-dashboard.git](https://github.com/Saadan-not-a-coder/-truthos-admin-dashboard.git)
cd -truthos-admin-dashboard
npm install
cp .env.example .env


2. Configure Your Supabase Infrastructure

Provision a free-tier project instance using your cloud platform account at supabase.com.

Apply schema updates directly via the dashboard SQL Editor or push migrations cleanly using the native CLI tooling:

npx supabase link --project-ref lnaafubqwfbascpnkkzm
npx supabase db push


Deploy Serverless Deno Edge Functions and map your configuration validation secrets:

npx supabase functions deploy create-organization
npx supabase functions deploy invite-member
npx supabase functions deploy promote-to-admin
npx supabase secrets set ADMIN_SIGNUP_CODE=Admin123SecretCode


Turn on standard Email Auth Provider under your authentication configuration panel.

Create your local test profile and run the elevation query script inside the SQL console:

SELECT public.promote_user_to_admin('admin@example.com');


3. Verify Local Environment Constants

Ensure your newly generated local .env configuration file accurately reflects your system references:

VITE_SUPABASE_URL=[https://lnaafubqwfbascpnkkzm.supabase.co](https://lnaafubqwfbascpnkkzm.supabase.co)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
VITE_ADMIN_SIGNUP_CODE=Admin123SecretCode


Run the local development engine:

npm run dev


Navigate your browser directly to http://localhost:5173 to verify runtime compilation.

System Architecture & Data Modeling

flowchart LR
  subgraph client [React 18 SPA client bundle]
    RQ[TanStack Query Server State]
    RHF[React Hook Form + Zod]
  end
  subgraph supabase [Isolated Supabase Cloud Infrastructure]
    Auth[Supabase Go-Auth Session]
    DB[(Postgres Engine + RLS Engine)]
    EF[Deno Serverless Edge Functions]
  end
  RQ --> Auth
  RQ --> DB
  RHF --> EF
  EF --> DB


Tradeoffs & Shortcuts

Stubbed Email Transports: Member invite records are written directly into database entries with an explicit runtime layout location where a provider such as Resend or SendGrid would safely connect.

Simplified Invite Lifecycle: Invited users default immediately to an invited configuration state without a full magic-link verification sign-up loop to fit strictly within the 8-10 hour implementation constraints.

Unified Testing Schema: Staged preview environments share a single database layer tracking production targets. In an enterprise system, instances would be fully separated down to distinct project boundaries.

Loom Demonstration Walkthrough

Add your video link here once you have finished recording your walkthrough.

License

Distributed under the MIT License. See LICENSE for details.