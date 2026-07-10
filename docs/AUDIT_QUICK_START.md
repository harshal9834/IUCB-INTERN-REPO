# AUDIT LOGGING - QUICK START GUIDE

## 5-Minute Setup

### 1. Verify Backend is Running

```bash
# Check backend status
curl http://localhost:5000/api/v1/audit/stats \
  -H "Authorization: Bearer <your_jwt_token>"
```

### 2. Get Auth Token

```bash
# Login to get JWT token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iucb.org",
    "password": "Admin@2026"
  }'

# Copy the token from response
```

### 3. Test Basic Endpoints

```bash
# Get last 20 audit logs
curl "http://localhost:5000/api/v1/audit/logs?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get dashboard data
curl "http://localhost:5000/api/v1/audit/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search audit logs
curl "http://localhost:5000/api/v1/audit/logs/search?query=login" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Using in Routes

### Example 1: Create Endpoint with Audit

```typescript
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { setupAuditContext, auditCreate } from '../middlewares/audit.middleware';
import MyController from '../controllers/my.controller';

const router = Router();

router.post(
  '/',
  protect,                                  // ← Authentication
  setupAuditContext,                       // ← Audit context
  auditCreate('MyEntity', 'MyModule'),    // ← Auto audit logging
  MyController.create                      // ← Your controller
);

export default router;
```

### Example 2: Update Endpoint with Audit

```typescript
router.patch(
  '/:id',
  protect,
  setupAuditContext,
  auditUpdate('MyEntity', 'MyModule'),    // ← Captures before/after
  MyController.update
);
```

### Example 3: Delete Endpoint with Audit

```typescript
router.delete(
  '/:id',
  protect,
  setupAuditContext,
  auditDelete('MyEntity', 'MyModule'),    // ← HIGH severity
  MyController.delete
);
```

---

## Available Middleware Functions

```typescript
// Authentication
auditLogin              // Admin login
auditLogout             // Admin logout
auditFailedLogin        // Failed login attempt

// CRUD
auditCreate(entity, module)
auditUpdate(entity, module)
auditDelete(entity, module)

// Status Changes
auditStatusChange(entity, module)
auditApproval(entity, module)
auditRejection(entity, module)

// Operations
auditGenerate(entity, module)
auditDownload(entity, module)
auditUpload(entity, module)
auditExport(entity, module)
auditImport(entity, module)
```

---

## API Quick Reference

### Get Audit Logs

```bash
# Last 20 logs
GET /api/v1/audit/logs

# Page 2, 50 per page
GET /api/v1/audit/logs?page=2&limit=50

# Filter by severity
GET /api/v1/audit/logs?severity=HIGH

# Filter by action
GET /api/v1/audit/logs?action=DELETE

# Date range
GET /api/v1/audit/logs?dateFrom=2026-07-01&dateTo=2026-07-05

# Search
GET /api/v1/audit/logs/search?query=organization
```

### Get Dashboard

```bash
# Last 7 days
GET /api/v1/audit/dashboard?period=7d

# Last 30 days
GET /api/v1/audit/dashboard?period=30d

# Last 90 days
GET /api/v1/audit/dashboard?period=90d
```

### Get Statistics

```bash
# All time
GET /api/v1/audit/stats

# Date range
GET /api/v1/audit/stats?dateFrom=2026-07-01&dateTo=2026-07-05
```

### Get Analytics for Charts

```bash
# Last 30 days, grouped by day
GET /api/v1/audit/analytics?period=30d&groupBy=day

# Options for groupBy: hour, day, week, month
```

### Get Security Alerts

```bash
# Active alerts
GET /api/v1/audit/alerts

# Acknowledge alert
PATCH /api/v1/audit/alerts/<alert_id>/acknowledge

# Resolve alert
PATCH /api/v1/audit/alerts/<alert_id>/resolve
```

---

## Environment Variables

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iucb_audit

# API Configuration
API_URL=http://localhost:5000/api/v1
FRONTEND_URL=http://localhost:8080

# Authentication
JWT_SECRET=your-very-secret-key-here
JWT_EXPIRY=7d

# Audit Configuration (optional)
AUDIT_LOG_LEVEL=INFO  # DEBUG, INFO, WARN, ERROR
ENABLE_RISK_SCORING=true
ENABLE_ALERTS=true
```

---

## Troubleshooting

### "Audit logs not creating"

Check:
1. Middleware is applied to route
2. Database connection is working
3. JWT token is valid
4. Backend is running on port 5000

```bash
# Test database connection
npm run prisma:generate

# Check logs
tail -f backend/logs/app.log
```

### "Permission denied"

- SUPER_ADMIN can see all logs
- ADMIN can see own logs only
- Use SUPER_ADMIN token to see all

```bash
# Login as super admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -d '{"email": "admin@iucb.org", "password": "Admin@2026"}'
```

### "Slow queries"

Check database indexes:

```sql
-- Login to postgres
psql postgresql://user:password@localhost:5432/iucb_audit

-- Check indexes
SELECT * FROM pg_stat_user_indexes 
WHERE tablename = 'AuditLog';

-- Optimize
VACUUM ANALYZE AuditLog;
```

---

## Files Reference

**Core Files**:
- `backend/src/services/audit.service.ts` - Business logic
- `backend/src/repositories/audit.repository.ts` - Data access
- `backend/src/controllers/audit.controller.ts` - API handlers
- `backend/src/middlewares/audit.middleware.ts` - Auto logging
- `backend/src/routes/audit.routes.ts` - API routes

**Database**:
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/` - Database migrations

**Config**:
- `backend/.env` - Environment variables
- `backend/package.json` - Dependencies

---

## Testing Commands

```bash
# Build backend
npm run build

# Start backend
npm run dev

# Test audit logs endpoint
curl http://localhost:5000/api/v1/audit/logs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Monitor logs in real-time
npm run logs  # if available

# Database management
npx prisma studio  # Open Prisma Studio
```

---

## Performance Tips

1. **Use pagination**: Always use `limit` and `page` parameters
2. **Filter early**: Use `dateFrom`/`dateTo` to reduce data
3. **Index optimization**: Ensure database indexes are created
4. **Cache results**: Consider caching dashboard data
5. **Archive old logs**: Implement retention policies for Phase 2

---

## Contact & Support

For issues or questions:
1. Check `AUDIT_LOGGING_PHASE_1.md` for detailed docs
2. Review `ERD_AUDIT_SYSTEM.md` for data model
3. Check server logs for errors
4. Verify database connectivity

**Documentation Files**:
- `AUDIT_LOGGING_PHASE_1.md` - Complete guide
- `AUDIT_QUICK_START.md` - This file
- `AUDIT_API_ENDPOINTS.md` - API reference
- `ERD_AUDIT_SYSTEM.md` - Database design
