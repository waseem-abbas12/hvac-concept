# Architecture Decision Records (ADR) — Watech-BI Production Transition

## ADR-01: Hybrid Local-First Cache + Server-Side PostgreSQL/Prisma Architecture
- **Status:** Accepted
- **Context:** Prompts 01–25 were built on a rich client-side Dexie.js (IndexedDB) engine with 50+ stores. While great for offline use and client speed, client-side IndexedDB cannot guarantee multi-user access security, cryptographic tenant isolation, server-side cron automation, or team collaboration.
- **Decision:** Implement a dual-layer architecture:
  1. A robust server-side PostgreSQL database managed by Prisma ORM with strict Row-Level Security (RLS) policies and session-based tenant isolation.
  2. Maintain the existing Dexie repository interface as a client cache and offline persistence layer, with an automated bridge that can ingest and synchronize records.
- **Consequences:** Eliminates IDOR and cross-tenant leakage hazards at the API layer, while retaining 100% of the client UI components and existing data structures.

## ADR-02: Cryptographic Tenant Session Token (JWT/Cookie)
- **Status:** Accepted
- **Context:** Passing tenant IDs in API request bodies or query parameters without server-side membership validation opens severe IDOR vulnerabilities.
- **Decision:** Authenticated requests must carry an HttpOnly, SameSite, Secure JWT session cookie containing `userId`, `tenantId`, `role`, and `isPlatformSuperAdmin`. The server independently resolves the tenant context from the session rather than trusting client-supplied parameters.
- **Consequences:** Prevents any tenant from accessing another tenant's records by tampering with request payloads.

## ADR-03: Vercel Serverless & Cron Model
- **Status:** Accepted
- **Context:** Deploying to Vercel requires stateless serverless execution. Long-running Node.js background daemons are not supported.
- **Decision:** Utilize Vercel Cron jobs (`vercel.json`) invoking protected `/api/cron/*` endpoints with a high-entropy bearer token `CRON_SECRET`. Tasks are partitioned into bounded, idempotent micro-batches.
- **Consequences:** Reliable execution of daily briefings, follow-up reminders, and sync routines within serverless timeout limits.
