# Quick Setup - 3 Steps to Login

## Step 1: Seed the Database

```bash
cd backend
npx prisma db seed
```

## Step 2: Start the Backend

```bash
cd backend
npm run dev
```

## Step 3: Login with These Credentials

**URL**: http://localhost:8080/admin/login

| Field | Value |
|-------|-------|
| **Email** | `admin@iucb.org` |
| **Password** | `Admin@2026` |

---

## That's It! 🎉

If login fails, run the diagnostic:

```bash
npx tsx backend/diagnostic.ts
```

---

## Notes

- The seed is **idempotent** - safe to run multiple times
- All passwords are bcrypt-hashed (never stored plain text)
- Two admin accounts are created:
  - `admin@iucb.org` / `Admin@2026`
  - `superadmin@iucb.org` / `SuperAdminPass123!`
- Sample data included: 5 orgs, 10 auditors, 20 credentials, etc.
