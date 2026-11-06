# Production Blockers & External Dependencies Register

This document lists all required external credentials, environment variables, or owner approvals necessary for complete live production deployment.

| Item | Dependency | Category | Status | Impact if Missing | Owner Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DATABASE_URL** | Production PostgreSQL Database (e.g., Supabase / Neon / AWS RDS) | Infrastructure | **PENDING CONFIG** | Application operates in client-side Dexie mode or demo SQLite/mock backend; live cloud multi-tenant DB cannot be populated. | Supply PostgreSQL connection string in Vercel project environment variables. |
| **JWT_SECRET** | Cryptographic 64-char signing secret | Security | **AUTONOMOUSLY GENERATED** | Can generate high-entropy fallback for preview; owner should specify production secret. | Optional override for production. |
| **RESEND_API_KEY / SMTP** | Transactional Email Provider | Communications | **PENDING CONFIG** | Outbound password resets, user invitations, and client alerts log to console/mock queue instead of sending real emails. | Supply Resend API key or SMTP credentials for live email delivery. |
| **STRIPE_SECRET_KEY** | Payment Gateway | Billing | **OPTIONAL (MOCK SUPPORTED)** | Billing operates in manual/offline mode; credit card checkout disabled. | Supply Stripe API keys and Webhook secret if live automated billing is desired. |
| **CRON_SECRET** | Vercel Cron Authentication | Automation | **AUTONOMOUSLY GENERATED** | Scheduled cron tasks won't be authorized without token. | Add `CRON_SECRET` to Vercel env. |
