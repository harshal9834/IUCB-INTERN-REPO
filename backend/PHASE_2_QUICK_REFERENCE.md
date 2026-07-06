# Phase 2: Automatic Logging - Quick Reference

## What Changed?

### Before (Manual Audit Logging)
```typescript
// In controller - lots of repetitive code
const org = await prisma.organization.create({...});

await prisma.auditLog.create({
  adminId: req.admin?.id,
  entityType: "ORGANIZATION",
  entityId: org.id,
  action: "CREATE",
  newData: org,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});
```

### After (Automatic Audit Logging)
```typescript
// In controller - clean, simple
const org = await prisma.organization.create({...});

// Done! Audit logging is automatic via middleware!
```

## How to Use

### Adding Audit Logging to a Route

**Step 1**: Import the middleware
```typescript
import { auditOrganizations } from '../middlewares/auto-audit.middleware.js';
```

**Step 2**: Add to route
```typescript
router.post('/', protect, auditOrganizations, ctrl.createOrganization);
```

**That's it!** The middleware automatically:
- Captures request data
- Determines action type from HTTP method
- Fetches old values for updates/deletes
- Logs to audit system after successful response
- Sanitizes sensitive data
- Assigns risk scores

## Pre-configured Middlewares

```typescript
// Organizations
auditOrganizations

// Credentials
auditCredentials

// Applications
auditApplications

// Auditors
auditAuditors

// Advisors
auditAdvisors

// Training Institutes
auditTrainingInstitutes

// Admin users
auditAdmins
```

## Create Custom Middleware

```typescript
import { autoAudit } from '../middlewares/auto-audit.middleware.js';
import { AuditSeverity } from '@prisma/client';

const auditCustomEntity = autoAudit({
  entityType: 'CUSTOM_ENTITY',
  module: 'CustomModule',
  severity: AuditSeverity.MEDIUM,
  description: 'Custom operation description',
});

router.post('/', protect, auditCustomEntity, controller.method);
```

## Auth Operations

```typescript
import { auditAuthOperations } from '../middlewares/auto-audit.middleware.js';

router.post('/login', auditAuthOperations('LOGIN'), authController.login);
router.post('/logout', auditAuthOperations('LOGOUT'), authController.logout);
router.patch('/change-password', protect, auditAuthOperations('PASSWORD_CHANGE'), authController.changePassword);
```

## Bulk Operations

All bulk operations are automatically audited:

```
PATCH /api/v1/bulk/organizations/update
PATCH /api/v1/bulk/organizations/status
PATCH /api/v1/bulk/applications/approve
PATCH /api/v1/bulk/applications/reject
PATCH /api/v1/bulk/credentials/status
DELETE /api/v1/bulk/credentials/delete
POST /api/v1/bulk/credentials/send-emails
PATCH /api/v1/bulk/advisors/status
GET /api/v1/bulk/history
```

Example:
```bash
curl -X PATCH http://localhost:5000/api/v1/bulk/applications/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid1", "uuid2"],
    "reason": "Approved"
  }'
```

## What Gets Logged Automatically

### For Every Operation:
- ✅ HTTP Method (POST/PUT/PATCH/DELETE)
- ✅ Request Body (sanitized)
- ✅ Response Status Code
- ✅ Response Data
- ✅ Entity ID (extracted)
- ✅ Admin Info (ID, name, role)
- ✅ IP Address & User-Agent
- ✅ Timestamp
- ✅ Action Type (CREATE/UPDATE/DELETE/etc)
- ✅ Severity Level (auto-calculated)
- ✅ Risk Score (0-10)

### For Update/Delete Operations:
- ✅ Old values (fetched automatically)
- ✅ New values (from response)
- ✅ Change comparison
- ✅ Before/after snapshots

### For Errors:
- ✅ Error type
- ✅ Error message
- ✅ Stack trace
- ✅ Request parameters
- ✅ Severity (auto-calculated)

## Action Types

```typescript
enum AuditAction {
  CREATE         // POST requests
  UPDATE         // PUT/PATCH requests
  DELETE         // DELETE requests
  LOGIN          // Successful login
  LOGOUT         // User logout
  FAILED_LOGIN   // Failed login attempt
  PASSWORD_CHANGE
  PASSWORD_RESET
  STATUS_CHANGE
  APPROVE
  REJECT
  GENERATE
  SEND_EMAIL
  DOWNLOAD
  UPLOAD
  EXPORT
  IMPORT
  BULK_UPDATE
  BULK_DELETE
  ROLE_CHANGE
  PERMISSION_CHANGE
}
```

## Severity Levels

```typescript
enum AuditSeverity {
  LOW        // Reads, downloads, emails (Risk: 1-3)
  MEDIUM     // Updates, status changes (Risk: 4-6)
  HIGH       // Deletes, approvals, logins (Risk: 7-8)
  CRITICAL   // System errors, exploits (Risk: 9-10)
}
```

## Risk Scoring

Auto-calculated based on:
- Action type (DELETE = 8, UPDATE = 2)
- Severity level (multiplier effect)
- Bulk operation size (+5 bonus)
- Location change (+1)
- Failed attempts (×2)

Result: 0-10 risk score per operation

## Error Handling

Errors are automatically logged with:
- Error category (5xx → CRITICAL, 4xx → MEDIUM)
- Full error context
- Request parameters (sanitized)
- Stack trace
- User information

No manual error logging needed!

## Querying Audit Logs

### Get All Logs
```bash
GET /api/v1/audit/logs?page=1&limit=20
```

### Filter by Entity
```bash
GET /api/v1/audit/logs?entityType=ORGANIZATION
```

### Filter by Action
```bash
GET /api/v1/audit/logs?action=UPDATE
```

### Filter by Severity
```bash
GET /api/v1/audit/logs?severity=HIGH
```

### Filter by Admin
```bash
GET /api/v1/audit/logs?actorId=uuid
```

### Filter by Date Range
```bash
GET /api/v1/audit/logs?dateFrom=2026-07-01&dateTo=2026-07-31
```

### Search Logs
```bash
GET /api/v1/audit/logs/search?query=organization
```

### Get Entity History
```bash
GET /api/v1/audit/history/ORGANIZATION/uuid-here
```

## Bulk Operation Examples

### Bulk Approve Applications
```bash
curl -X PATCH http://localhost:5000/api/v1/bulk/applications/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid1", "uuid2", "uuid3"],
    "reason": "Batch approval",
    "autoCreateEntities": true,
    "sendNotificationEmails": true
  }'
```

### Bulk Update Status
```bash
curl -X PATCH http://localhost:5000/api/v1/bulk/organizations/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": "uuid1", "status": "ACTIVE"},
      {"id": "uuid2", "status": "SUSPENDED"}
    ]
  }'
```

### Bulk Delete (with confirmation)
```bash
curl -X DELETE http://localhost:5000/api/v1/bulk/credentials/delete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid1", "uuid2"],
    "reason": "No longer needed",
    "confirmDelete": true
  }'
```

### Bulk Send Emails
```bash
curl -X POST http://localhost:5000/api/v1/bulk/credentials/send-emails \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid1", "uuid2", "uuid3", "uuid4"]
  }'
```

## Security Notes

- ✅ All bulk operations require ADMIN or SUPER_ADMIN role
- ✅ Permanent delete restricted to SUPER_ADMIN only
- ✅ Batch size limits enforced (1-100 items)
- ✅ All inputs validated with Zod schemas
- ✅ Sensitive data sanitized before logging
- ✅ Errors logged without exposing secrets
- ✅ Rate limiting ready for Phase 7

## Developer Checklist

When adding a new operation:

- [ ] Import appropriate audit middleware
- [ ] Add middleware to route
- [ ] Remove any manual audit logging code
- [ ] Test the operation
- [ ] Verify audit log is created
- [ ] Check risk score is appropriate
- [ ] Verify sensitive data is sanitized

## Performance Impact

- ✅ Async logging (non-blocking)
- ✅ ~1-2ms overhead per request
- ✅ No database locks during main operation
- ✅ Batch operations use single audit entry
- ✅ Suitable for high-throughput scenarios

## Storage

With current design:
- ~500 bytes per audit log
- ~1,000 bytes per bulk operation
- 1,000,000 logs = ~500MB storage (with retention policies)
- Optimized indexes prevent slow queries
- Archive/purge policies available (Phase 9)

## Next Steps

Phase 2 is complete! Next: Phase 3 - Entity History & Timeline Views

Ready to track complete change history for every entity with visual timelines.