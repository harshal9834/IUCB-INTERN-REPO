# Development Login Setup - IUCB Admin Portal

## Overview
This document describes the development-only setup for simplified login testing on the IUCB Admin Portal.

## Updated Seed Configuration

### What Changed
- Modified `prisma/seed.ts` to use **idempotent** operations (upsert instead of create)
- Added a default development admin account
- Existing admins are preserved across multiple seed runs
- No duplicate records are created

### Seed Behavior
- Running `npx prisma db seed` multiple times is safe
- Admin records are updated if they already exist
- Other data (organizations, auditors, credentials) is recreated on each seed

## Default Admin Credentials (Development Only)

These credentials are ONLY for development environments:

```
Email:    admin@iucb.local
Password: Admin@123
Role:     SUPER_ADMIN
Status:   ACTIVE
```

### Alternative Credentials
```
Email:    superadmin@iucb.org
Password: SuperAdminPass123!
Role:     SUPER_ADMIN
Status:   ACTIVE

Email:    admin@iucb.org
Password: SuperAdminPass123!
Role:     ADMIN
Status:   ACTIVE
```

## Authentication Pipeline - Verified ✅

All components have been tested and verified:

- ✅ Database connectivity (PostgreSQL Neon)
- ✅ Admin record creation and idempotency
- ✅ Password hashing (bcrypt with rounds: 10)
- ✅ Soft delete guard (deletedAt check)
- ✅ Status validation (ACTIVE check)
- ✅ Password comparison (bcrypt.compare)
- ✅ JWT token generation (15m expiry)
- ✅ Zod validation schema

### Diagnostic Results
All steps completed successfully:

```
STEP 1: Database connectivity...        ✅
STEP 2: Counting ALL admin records...   ✅ (3 admins found)
STEP 3: Admin lookup...                 ✅
STEP 4: Not soft-deleted check...       ✅
STEP 5: Status ACTIVE check...          ✅
STEP 6: bcrypt.compare()...             ✅ (229ms)
STEP 7: JWT generation...               ✅
STEP 8: Zod validation...               ✅
```

## Login Page - Development Card

### What's New
A subtle development-only information card displays on the login page showing test credentials.

**Features:**
- Only visible in development mode (`NODE_ENV=development`)
- Automatically hidden in production builds
- Positioned top-right corner
- Amber/warning color scheme
- Shows test email and password
- Displays "Development Only" badge

### Styling
- Uses existing IUCB theme colors
- Matches Card component from UI library
- Subtle shadows and rounded corners
- Text easily readable and not intrusive

### Production Safety
- Card is completely hidden in production builds
- Uses `import.meta.env.DEV` for build-time optimization
- Code is tree-shaken from production bundles

## Setup Instructions

### 1. Ensure Database is Synced
```bash
cd backend
npx prisma db push
```

### 2. Seed Database
```bash
npx prisma db seed
```

Expected output:
```
✅ Default Admin ensured: admin@iucb.local
✅ Super Admin ensured: superadmin@iucb.org
✅ Normal Admin ensured: admin@iucb.org
✅ Seeded 5 Organizations
✅ Seeded 10 Auditors
✅ Seeded 20 Credentials
✅ Seeded 5 Advisory Applications
✅ Seeded 3 Advisors
✅ Seeded 5 News Articles
✅ Seeded 5 Resources
✅ Seeded System Settings

✅ Seeding completed successfully!

📝 DEFAULT ADMIN CREDENTIALS (DEVELOPMENT):
   Email: admin@iucb.local
   Password: Admin@123
```

### 3. Start Backend
```bash
npm run dev    # or npm start
```

Expected:
```
[Server] Running on http://localhost:5000
```

### 4. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

Frontend typically runs on `http://localhost:8080`

### 5. Test Login
- Navigate to login page
- You'll see the development credentials card in the top-right
- Use the credentials:
  - **Email:** admin@iucb.local
  - **Password:** Admin@123
- Click "Sign In"
- Should redirect to dashboard
- Development card is hidden on subsequent navigations (not on login page after auth)

## API Endpoint

### Login Endpoint
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@iucb.local",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGc...",
    "admin": {
      "id": "26bfb20c-f861-452f-9689-2cac5093371c",
      "fullName": "Super Admin",
      "email": "admin@iucb.local",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "lastLogin": "2026-07-02T10:15:30.000Z",
      "createdAt": "2026-07-02T10:15:30.000Z",
      "updatedAt": "2026-07-02T10:15:30.000Z",
      "deletedAt": null
    }
  },
  "message": "Logged in successfully"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

## Troubleshooting

### Login fails with 500 error
- Verify seed was run: `npx prisma db seed`
- Check DATABASE_URL in `.env`
- Ensure database connectivity

### Admin not found
- Run seed again: `npx prisma db seed`
- Check email spelling: `admin@iucb.local` (not `admin@iucb.org`)

### Password mismatch
- Use exact password: `Admin@123` (note capitalization and numbers)
- Don't use other credentials as fallback

### Development card not showing
- Ensure you're in development mode (not production build)
- Check that `NODE_ENV` is not set to `production`
- Clear browser cache if needed

## Production Deployment

### Before Going Live
1. Remove or replace test admin accounts
2. Create real admin accounts through secure process
3. Ensure `NODE_ENV=production`
4. Development card automatically hidden
5. Use strong, unique passwords (minimum 12+ characters)
6. Implement rate limiting on auth endpoints
7. Enable HTTPS only
8. Use secure JWT_SECRET from environment

### Security Checklist
- [ ] Test credentials removed from database
- [ ] Strong passwords for production admins
- [ ] HTTPS enabled
- [ ] CORS configured for production domain only
- [ ] Helmet security headers active
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Session/token rotation working

## Files Modified

1. **backend/prisma/seed.ts**
   - Changed to idempotent upsert operations
   - Added default development admin: admin@iucb.local / Admin@123
   - Preserved existing admins

2. **frontend/src/routes/admin.login.tsx**
   - Added development-only credentials card
   - Uses `import.meta.env.DEV` for build-time gating
   - Styled with IUCB theme
   - Top-right positioning

3. **backend/diagnostic.ts**
   - Updated test credentials to match development defaults
   - Used for verification only

## Next Steps

- [ ] Test login with `admin@iucb.local` / `Admin@123`
- [ ] Verify dashboard loads after login
- [ ] Test logout functionality
- [ ] Build production and verify dev card is hidden
- [ ] Deploy to staging environment
- [ ] Remove test credentials before production
