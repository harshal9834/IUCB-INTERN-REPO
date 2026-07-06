# Credential ID Generation - Quick Reference

## Format

| Type | Prefix | Examples |
|------|--------|----------|
| Organization | `IUCB-ORG` | `IUCB-ORG-000001`, `IUCB-ORG-000022` |
| Auditor | `IUCB-AUD` | `IUCB-AUD-000001`, `IUCB-AUD-000009` |
| Training | `IUCB-TI` | `IUCB-TI-000001`, `IUCB-TI-000005` |
| Advisory | `IUCB-ADV` | `IUCB-ADV-000001`, `IUCB-ADV-000016` |

## Key Rules

1. **Automatic** - System generates IDs automatically
2. **No Manual Entry** - Admin CANNOT specify credential IDs
3. **Independent Sequences** - Each type has its own counter
4. **Never Reset** - Sequences only go forward (001, 002, 003, ...)
5. **No Reuse** - Deleted credentials don't free up old numbers
6. **Unique** - All IDs are globally unique in database

## API Endpoints

### Generate Credential
```
POST /api/v1/credentials/generate

Body:
{
  "applicationId": "uuid",
  "standard": "ISO/IEC 27001:2022",
  "issueDate": "2026-02-10",
  "expiryDate": "2029-02-10",
  "auditorId": "uuid",  // optional
  "internalNotes": "notes"  // optional
}

Response:
{
  "credential": {
    "credentialNumber": "IUCB-ORG-000022",  // ← AUTO-GENERATED
    ...
  }
}
```

### Get Statistics
```
GET /api/v1/credentials/stats/next-ids

Response:
{
  "stats": {
    "ACCREDITATION": {
      "prefix": "IUCB-ORG",
      "nextId": "IUCB-ORG-000023",
      "count": 22
    },
    "AUDITOR": {
      "prefix": "IUCB-AUD",
      "nextId": "IUCB-AUD-000003",
      "count": 2
    },
    ...
  }
}
```

## Frontend Usage

```typescript
// 1. Call generate endpoint
const response = await generateCredential({
  applicationId: "550e8400...",
  standard: "ISO 9001:2015",
  issueDate: "2026-02-10",
  expiryDate: "2029-02-10"
});

// 2. Extract generated ID
const credentialId = response.data.credential.credentialNumber;
// Example: "IUCB-ORG-000022"

// 3. Display as read-only
<input type="text" value={credentialId} readOnly />
```

## Examples

### First Organization
- No credentials exist yet
- System generates: `IUCB-ORG-000001`

### Next Organization (after -000022 exists)
- Latest org credential: `IUCB-ORG-000022`
- System generates: `IUCB-ORG-000023`

### After Deletion
- If `IUCB-ORG-000022` is deleted
- And `IUCB-ORG-000023` exists
- New org credential: `IUCB-ORG-000024` (does NOT reuse -000022)

## Validator Updates

**REMOVED from request:**
- `credentialNumber` - Not accepted, auto-generated

**ADDED to request:**
- `applicationId` - Required, links to approved application
- `internalNotes` - Optional, for admin use

## Service Location

`backend/src/services/credential-id.service.ts`

Key methods:
- `generateNextId(type)` - Get next ID for type
- `getCurrentSequence(type)` - Get current count
- `getCredentialStats()` - Get stats for all types

## Status

✅ Production Ready
- Automatic generation working
- No manual entry possible
- All types have independent sequences
- Unique constraint enforced
- TypeScript verified (no errors)
