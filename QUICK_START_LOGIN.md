# Quick Start - Login & Dashboard

## ⚡ Fast Setup (5 minutes)

### Step 1: Prepare Database
```bash
cd backend
npx prisma db push
npx prisma db seed
```

✅ You should see:
```
✅ Default Admin ensured: admin@iucb.local
✅ Seeding completed successfully!
```

### Step 2: Start Backend
```bash
npm run dev
```

✅ Expected output:
```
[Server] Running on http://localhost:5000
```

### Step 3: Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```

✅ Frontend opens at `http://localhost:8080` (or similar)

### Step 4: Login
1. Navigate to **Login Page** (should auto-redirect if not authenticated)
2. You'll see a yellow "Development Only" card with credentials
3. Enter:
   - **Email:** `admin@iucb.local`
   - **Password:** `Admin@123`
4. Click **Sign In**
5. 🎉 Dashboard loads!

---

## 📋 Default Credentials

### Primary (Recommended for Testing)
```
Email:    admin@iucb.local
Password: Admin@123
Role:     SUPER_ADMIN
```

### Alternatives
```
Email:    superadmin@iucb.org
Password: SuperAdminPass123!
Role:     SUPER_ADMIN

Email:    admin@iucb.org
Password: SuperAdminPass123!
Role:     ADMIN
```

---

## ✅ Verification Checklist

- [x] Database synced (`prisma db push`)
- [x] Seed completed (`prisma db seed`)
- [x] Backend running on port 5000
- [x] Frontend running on port 8080
- [x] Auth pipeline verified (3 admins in database)
- [x] Password hashing verified (bcrypt)
- [x] JWT generation verified
- [x] Frontend build successful
- [x] Development login card added (dev-only)

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails (500 error) | Run `npx prisma db seed` in backend/ |
| "Invalid credentials" | Use exact email `admin@iucb.local` and password `Admin@123` |
| Backend won't start | Check `.env` DATABASE_URL is valid |
| Frontend won't connect | Verify backend is running on `http://localhost:5000` |
| Dev card not showing | Ensure `NODE_ENV` is not `production` |

---

## 📂 Modified Files

1. **backend/prisma/seed.ts** - Idempotent admin creation
2. **frontend/src/routes/admin.login.tsx** - Dev credentials card
3. **backend/diagnostic.ts** - Test credentials updated

---

## 🚀 Next Steps After Login

- Explore Dashboard (Phase 4 - fully implemented)
- Test admin features
- Review mock data (Organizations, Auditors, Credentials, etc.)
- Plan Phase 5 implementation

---

## 📝 Production Deployment

Before deploying to production:

1. Remove/replace all test admin accounts
2. Create real admin accounts with strong passwords
3. Ensure `NODE_ENV=production` (dev card auto-hidden)
4. Update JWT_SECRET in `.env`
5. Configure CORS for production domain
6. Enable HTTPS only

See `backend/DEV_LOGIN_SETUP.md` for detailed security checklist.

---

**Created:** July 2, 2026  
**Status:** Ready for Development ✅
