# IUCB Project Custom Rules

## Official API Contract

The following API endpoints defined in the IUCB PRD are the official backend contract and must not be renamed or replaced:

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard/metrics`
- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `PATCH /api/v1/organizations/:id/status`
- `GET /api/v1/auditors`
- `POST /api/v1/credentials/issue`
- `POST /api/v1/advisory/apply`
- `GET /api/v1/advisory/applications`
- `POST /api/v1/advisory/applications/:id/decision`
- `GET /api/v1/public/advisors`

If additional endpoints are required for a complete production CRUD implementation (such as GET by ID, UPDATE, DELETE, pagination, filters, etc.), extend the API while keeping these PRD endpoints unchanged and fully compatible.

## Database Preservation Rules

- **NEVER** run `npx prisma migrate reset`, `npx prisma db push --force-reset`, or any command that drops the database.
- **NEVER** call `deleteMany()` automatically or reseed the database on startup.
- If a Prisma migration conflict (drift) occurs, resolve it safely (e.g. `npx prisma migrate resolve`) or notify the user. **DO NOT** use the nuclear option of resetting the database. All existing data must be preserved.
