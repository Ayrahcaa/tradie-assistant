# Tradie Assistant

Tradie Assistant is a presentation-ready business-management prototype for Australian sole traders. It brings customers, jobs, quotes, invoices, payments, expenses, receipts and subcontractor work into one clear workspace.

## Technology

- React 19, TypeScript, Vite and React Router
- TanStack Query, Tailwind CSS and Lucide icons
- Node.js, Express and TypeScript
- Prisma ORM with PostgreSQL
- npm workspaces (`apps/web` and `apps/api`)

## Prototype features

- Real-data business dashboard with current KPIs, active jobs and recent activity
- Customer and project management
- Project financial summaries separating estimated profit from actual cash position
- Quotes and invoices with line items, GST, statuses and dates
- Customer payment history and outstanding invoice balances
- Expenses linked to projects with receipt upload/download
- Subcontractors, job-specific rate arrangements, project costs and payment history
- Business financial overview and two-sided outstanding-money view
- Responsive sidebar, cards, tables, forms, modals, loading states and empty states
- Safe AI Assistant “Coming Soon” presentation page
- Repeatable Australian demo dataset
- Email/password registration and login with persistent server-managed sessions
- Strict per-user business-data isolation and editable business profiles

## Prerequisites

- Node.js 24 or a compatible current Node.js release
- npm
- PostgreSQL running locally or accessible through a connection string

## Environment setup

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tradie_assistant"
PORT=4000
DEMO_USER_EMAIL="demo@tradieassistant.com"
DEMO_USER_PASSWORD="TradieDemo2026!"
WEB_ORIGIN="http://localhost:5173"
```

Optionally create `apps/web/.env` when the API is not at its default location:

```env
VITE_API_URL="http://localhost:4000/api"
```

Install dependencies from the repository root:

```bash
npm install
```

## Database and demo data

Apply existing migrations and generate the Prisma client:

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
cd ../..
```

Load the realistic demo data:

```bash
npm run seed
```

The seed is repeatable. It replaces records owned by the configured demo user, but does not reset the database or touch other users.

Local demo credentials:

- Email: `demo@tradieassistant.com`
- Password: `TradieDemo2026!`

Override the password with `DEMO_USER_PASSWORD` before seeding when desired. The password is hashed with Node.js `scrypt`; no plaintext password is stored in PostgreSQL.

## Start the prototype

Use two terminals from the repository root:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173).

Unauthenticated visitors are redirected to `/login`. Registration creates a private workspace and signs the new user in automatically.

## Authentication architecture

- `User` stores personal and business profile information.
- `PasswordCredential` stores the password hash separately from the account.
- `Session` stores only a SHA-256 hash of a cryptographically random opaque token.
- Web sessions use an HTTP-only, `SameSite=Lax` cookie. Production cookies also use `Secure`.
- Sessions expire after 30 days, are checked on every protected API request and are deleted on logout.
- All business services receive the authenticated `ownerId` explicitly. Related customer, project, invoice, expense and subcontractor IDs are validated against the same owner.
- TanStack Query restores `/api/auth/me` on load and clears all cached business data on login/logout to prevent account-to-account cache leakage.

The middleware already understands `Authorization: Bearer <session-token>` in addition to the web cookie, keeping the session layer compatible with a future mobile client. The current web login endpoints deliberately return the token only through the HTTP-only cookie.

### Future Google, Apple and Microsoft login

OAuth can be added without replacing `User` or the session system. A future `AuthIdentity` model can link `userId` to `provider`, `providerAccountId` and provider email. OAuth callbacks would resolve or create the core user, then call the existing session creation service. Password users would keep `PasswordCredential`; OAuth-only users would not require one.

## Verification commands

```bash
npm run build:web
npm run lint:web
npm run typecheck:api
npm run build:api

cd apps/api
npx prisma validate
npx prisma generate
```

## Financial definitions

- **Invoices issued:** non-draft, non-cancelled invoice totals.
- **Customer payments:** actual payments recorded against invoices.
- **Customer outstanding:** remaining balances on issued invoices.
- **Direct expenses:** project expenses excluding the legacy `SUBCONTRACTOR` category.
- **Subcontractor costs:** agreed amounts on non-cancelled structured subcontractor work records.
- **Estimated project profit:** quoted value (or issued invoices when no quote value exists) minus direct expenses and agreed subcontractor costs.
- **Cash position:** customer payments received minus paid direct expenses and subcontractor payments.

Legacy expenses categorised as `SUBCONTRACTOR` are reported separately and excluded from calculations that also use structured subcontractor work, preventing double counting.

## Known prototype limitations

- This is operational business information, not formal accounting or tax advice.
- Email verification, password reset/change, MFA, passkeys and OAuth providers are not implemented yet.
- OpenAI receipt extraction requires separate API billing and is not part of the working demo.
- Real card/payment processing and bank feeds are not connected.
- Email and SMS delivery are not connected.
- Receipt files use local server storage rather than cloud storage.
