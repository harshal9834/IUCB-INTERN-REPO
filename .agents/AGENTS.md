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
