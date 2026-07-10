# AUDIT SYSTEM - ENTITY RELATIONSHIP DIAGRAM

**Database**: PostgreSQL  
**ORM**: Prisma  
**Version**: 1.0.0  
**Date**: July 5, 2026

---

## Overview

The audit system consists of 4 core entities:

```
┌─────────────────────────────────────────────────────┐
│               AUDIT LOGGING SYSTEM                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐                              │
│  │    AuditLog      │ (Primary entity)            │
│  │                  │                              │
│  │  - Action Record │                              │
│  │  - Changes       │                              │
│  │  - Context       │                              │
│  └────────┬─────────┘                              │
│           │                                         │
│      ┌────┴─────┬──────────────┬──────────────┐   │
│      │           │              │              │   │
│   ┌──▼──┐   ┌──▼──┐      ┌──▼──┐        ┌──▼──┐ │
│   │Alert│   │Admin│      │Data │        │Hash │ │
│   │     │   │     │      │     │        │     │ │
│   └─────┘   └─────┘      └─────┘        └─────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Entity Definitions

### 1. AuditLog (Core Table)

**Purpose**: Store all audit events and changes

**Table**: `AuditLog`  
**Records per day**: ~50-100K (for typical system)  
**Table growth**: ~2-3GB per year (uncompressed)

```
┌─────────────────────────────────────────────────────┐
│              AuditLog                               │
├─────────────────────────────────────────────────────┤
│ Primary Key:                                        │
│ - id (UUID)                                         │
│                                                     │
│ Foreign Keys:                                       │
│ - actorId (Admin.id) [NULLABLE]                    │
│                                                     │
│ Actor Information:                                  │
│ - actorId: STRING (UUID)                           │
│ - actorName: STRING                                │
│ - actorRole: AdminRole ENUM                        │
│                                                     │
│ Entity Information:                                 │
│ - entityType: STRING                               │
│ - entityId: STRING (UUID)                          │
│                                                     │
│ Action & Context:                                  │
│ - action: AuditAction ENUM                         │
│ - module: STRING                                   │
│ - description: STRING                              │
│                                                     │
│ Data Changes:                                       │
│ - oldValues: JSON                                  │
│ - newValues: JSON                                  │
│ - metadata: JSON                                   │
│                                                     │
│ Device & Network:                                  │
│ - ipAddress: STRING                                │
│ - userAgent: STRING                                │
│ - device: STRING                                   │
│ - browser: STRING                                  │
│ - os: STRING                                       │
│ - country: STRING                                  │
│ - city: STRING                                     │
│                                                     │
│ Session & Request:                                 │
│ - sessionId: STRING (UUID)                         │
│ - requestId: STRING (UUID)                         │
│                                                     │
│ Status & Severity:                                 │
│ - status: STRING (SUCCESS|FAILED)                 │
│ - severity: AuditSeverity ENUM                     │
│ - riskScore: INT (0-10)                           │
│                                                     │
│ Integrity:                                          │
│ - hash: STRING (SHA-256)                           │
│ - previousHash: STRING                             │
│                                                     │
│ Timestamp:                                          │
│ - createdAt: DATETIME                              │
│                                                     │
│ Indexes:                                            │
│ - [actorId]                                        │
│ - [entityType]                                     │
│ - [action]                                         │
│ - [module]                                         │
│ - [severity]                                       │
│ - [status]                                         │
│ - [riskScore]                                      │
│ - [createdAt] ★ MOST USED                         │
│ - [sessionId]                                      │
│ - [ipAddress]                                      │
│                                                     │
│ Relations:                                          │
│ - admin: Admin (Optional)                          │
│ - snapshots: AuditSnapshot[]                       │
│ - alerts: AuditAlert[]                             │
└─────────────────────────────────────────────────────┘
```

**Sample Row**:

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d",
  "actorId": "b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e",
  "actorName": "John Doe",
  "actorRole": "SUPER_ADMIN",
  "entityType": "Organization",
  "entityId": "c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f",
  "action": "UPDATE",
  "module": "Organizations",
  "description": "Updated organization status",
  "oldValues": { "status": "ACTIVE" },
  "newValues": { "status": "SUSPENDED" },
  "metadata": { "reason": "License expired" },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "device": "Desktop",
  "browser": "Chrome 126.0",
  "os": "Windows 10",
  "country": "United States",
  "city": "New York",
  "sessionId": "d4e5f6a7-b8c9-7d8e-9f0a-1b2c3d4e5f6a",
  "requestId": "e5f6a7b8-c9d0-8e9f-0a1b-2c3d4e5f6a7b",
  "status": "SUCCESS",
  "severity": "MEDIUM",
  "riskScore": 5,
  "hash": "a1b2c3d4e5f6...",
  "previousHash": "z9y8x7w6v5u4...",
  "createdAt": "2026-07-05T10:30:00.000Z"
}
```

---

### 2. AuditAlert (Security Alerts)

**Purpose**: Track security incidents and anomalies

**Table**: `AuditAlert`  
**Status**: Usually 1-10 active alerts  
**Lifecycle**: Active → Acknowledged → Resolved/Dismissed

```
┌─────────────────────────────────────────────────────┐
│           AuditAlert                                │
├─────────────────────────────────────────────────────┤
│ Primary Key:                                        │
│ - id (UUID)                                         │
│                                                     │
│ Foreign Keys:                                       │
│ - auditLogId (AuditLog.id) [NULLABLE]              │
│ - assignedTo (Admin.id) [NULLABLE]                 │
│ - resolvedBy (Admin.id) [NULLABLE]                 │
│                                                     │
│ Alert Information:                                  │
│ - alertType: AlertType ENUM                        │
│ - severity: AuditSeverity ENUM                     │
│ - title: STRING                                    │
│ - description: STRING                              │
│ - metadata: JSON                                   │
│                                                     │
│ Status:                                             │
│ - status: AlertStatus ENUM                         │
│   (ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED)     │
│                                                     │
│ Assignment:                                         │
│ - assignedTo: UUID (Admin)                         │
│ - resolvedBy: UUID (Admin)                         │
│ - resolvedAt: DATETIME                             │
│                                                     │
│ Timestamp:                                          │
│ - createdAt: DATETIME                              │
│ - updatedAt: DATETIME                              │
│                                                     │
│ Indexes:                                            │
│ - [alertType]                                      │
│ - [severity]                                       │
│ - [status]                                         │
│ - [createdAt]                                      │
│                                                     │
│ Relations:                                          │
│ - auditLog: AuditLog (Optional)                    │
│ - assignee: Admin (Optional)                       │
│ - resolver: Admin (Optional)                       │
└─────────────────────────────────────────────────────┘
```

**Alert Type Examples**:

```
┌──────────────────────────────────────────┐
│ MULTIPLE_FAILED_LOGINS                   │
├──────────────────────────────────────────┤
│ Trigger: 5+ failed logins in 15 mins    │
│ Severity: HIGH                           │
│ Action: Lock account, notify admin       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ MASS_DELETE                              │
├──────────────────────────────────────────┤
│ Trigger: Bulk delete of 100+ records    │
│ Severity: HIGH/CRITICAL                  │
│ Action: Require approval, notify         │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ PRIVILEGE_ESCALATION                     │
├──────────────────────────────────────────┤
│ Trigger: Admin role granted to user     │
│ Severity: CRITICAL                       │
│ Action: Immediate investigation          │
└──────────────────────────────────────────┘
```

---

### 3. AuditSnapshot (Point-in-Time Data)

**Purpose**: Store complete entity state at time of change

**Table**: `AuditSnapshot`  
**Growth**: ~500MB per year (for typical system)

```
┌─────────────────────────────────────────────────────┐
│          AuditSnapshot                              │
├─────────────────────────────────────────────────────┤
│ Primary Key:                                        │
│ - id (UUID)                                         │
│                                                     │
│ Foreign Key:                                        │
│ - auditLogId (AuditLog.id)                         │
│                                                     │
│ Data:                                               │
│ - entityType: STRING                               │
│ - entityId: STRING (UUID)                          │
│ - snapshot: JSON (Complete entity state)           │
│ - timestamp: DATETIME                              │
│                                                     │
│ Indexes:                                            │
│ - [entityType]                                     │
│ - [entityId]                                       │
│ - [timestamp]                                      │
│                                                     │
│ Relations:                                          │
│ - auditLog: AuditLog                               │
└─────────────────────────────────────────────────────┘
```

**When Created**:

```
- On CREATE action
- On UPDATE action
- On DELETE action
- On STATUS_CHANGE action
- On APPROVE/REJECT actions
```

**Example Snapshot**:

```json
{
  "id": "f6a7b8c9-d0e1-9f0a-1b2c-3d4e5f6a7b8c",
  "auditLogId": "a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d",
  "entityType": "Organization",
  "entityId": "c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f",
  "snapshot": {
    "id": "c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f",
    "organizationName": "IUCB International",
    "registrationNumber": "REG-2024-001",
    "country": "United States",
    "address": "123 Main Street, New York",
    "email": "contact@iucb.org",
    "phone": "555-1234-5678",
    "website": "www.iucb.org",
    "status": "SUSPENDED",
    "accreditationDate": "2024-01-01",
    "expiryDate": "2026-01-01",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2026-07-05T10:30:00.000Z"
}
```

---

### 4. AuditIntegrity (Hash Chain)

**Purpose**: Verify audit log tamper-detection

**Table**: `AuditIntegrity`  
**Records**: One per verification cycle  
**Growth**: Minimal (~10KB per day)

```
┌─────────────────────────────────────────────────────┐
│         AuditIntegrity                              │
├─────────────────────────────────────────────────────┤
│ Primary Key:                                        │
│ - id (UUID)                                         │
│                                                     │
│ Integrity Data:                                     │
│ - chainHash: STRING (SHA-256) @unique             │
│ - blockCount: INT (number of verified blocks)      │
│ - lastVerified: DATETIME                           │
│ - isValid: BOOLEAN                                 │
│ - errorMessage: STRING (if invalid)                │
│ - createdAt: DATETIME                              │
│                                                     │
│ Indexes:                                            │
│ - [chainHash] @unique                              │
│ - [lastVerified]                                   │
│ - [isValid]                                        │
│                                                     │
│ No Relations                                        │
└─────────────────────────────────────────────────────┘
```

---

## Relationship Diagram

```
                    ┌──────────────┐
                    │    Admin     │
                    └──────┬───────┘
                           │
                  ┌────────┼────────┐
                  │        │        │
            (actorId)      │   (resolver)
                  │   (assignedTo)  │
                  │        │        │
        ┌─────────▼────┐   │   ┌────▼──────────┐
        │  AuditLog    │   │   │  AuditAlert   │
        │              │   │   │               │
        │ (PK) id      │   │   │ (PK) id       │
        │              │   │   │               │
        │ actorId ────┤┬──┘   │ alertType     │
        │ entityType  │└──────┤ severity      │
        │ entityId    │   (auditLogId)       │
        │ action      │       │ status       │
        │ severity    │       │ assignedTo ──┤
        │ riskScore   │       │ resolvedBy ──┤
        │ hash        │       └──────────────┘
        │             │
        │ createdAt   │
        └─────┬───────┘
              │
              │ (auditLogId)
              │
        ┌─────▼─────────┐
        │ AuditSnapshot │
        │               │
        │ (PK) id       │
        │ entityType    │
        │ entityId      │
        │ snapshot(JSON)│
        │ timestamp     │
        └───────────────┘


         ┌──────────────────────┐
         │  AuditIntegrity      │
         │                      │
         │ (PK) id              │
         │ chainHash (unique)   │
         │ blockCount           │
         │ lastVerified         │
         │ isValid              │
         │ createdAt            │
         └──────────────────────┘
         (Independent, no relations)
```

---

## Data Flow

### CREATE Operation

```
1. User creates Organization
   │
   ├─→ setupAuditContext Middleware
   │   └─ Generates requestId, captures IP, User-Agent, sessionId
   │
   ├─→ Route Handler
   │   └─ Creates Organization entity in DB
   │
   ├─→ auditCreate Middleware (async)
   │   └─ Calls AuditService.logAudit()
   │
   ├─→ AuditService.logAudit()
   │   ├─ Parses browser/OS/device
   │   ├─ Calculates riskScore
   │   ├─ Generates hash
   │   ├─ Calls AuditRepository.createAuditLog()
   │   ├─ Creates snapshot (if needed)
   │   ├─ Checks security alerts
   │   └─ Updates activity summary
   │
   ├─→ AuditRepository.createAuditLog()
   │   └─ Inserts into AuditLog table
   │
   └─→ Response sent immediately
       (Audit logging happens in background)
```

### UPDATE Operation

```
1. User updates Organization
   │
   ├─→ auditUpdate Middleware (async)
   │   └─ Calls AuditService.logAudit() with oldValues & newValues
   │
   ├─→ AuditService.logAudit()
   │   ├─ Captures old and new values
   │   ├─ Generates description of change
   │   ├─ Calculates riskScore (based on what changed)
   │   ├─ Creates snapshot with newValues
   │   └─ Checks if significant change (alert trigger?)
   │
   └─→ AuditLog created with before/after data
```

### ALERT Workflow

```
1. Security condition detected
   │
   ├─→ AuditService.checkSecurityAlerts()
   │   ├─ Check for MULTIPLE_FAILED_LOGINS
   │   ├─ Check for MASS_DELETE/MASS_UPDATE
   │   ├─ Check for PRIVILEGE_ESCALATION
   │   └─ Check for other threats
   │
   ├─→ AuditRepository.createAuditAlert()
   │   └─ Inserts alert into AuditAlert table
   │       Status: ACTIVE
   │
   ├─→ Alert appears in dashboard
   │   └─ Admins notified (Phase 2)
   │
   ├─→ Admin reviews alert
   │   │
   │   ├─→ ACKNOWLEDGE: admins review alert
   │   │   └─ PATCH /alerts/:id/acknowledge
   │   │       Status: ACKNOWLEDGED
   │   │
   │   ├─→ RESOLVE: confirmed safe or fixed
   │   │   └─ PATCH /alerts/:id/resolve
   │   │       Status: RESOLVED
   │   │
   │   └─→ DISMISS: false positive
   │       └─ Status: DISMISSED
```

---

## Index Strategy

### Primary Indexes (Most Used)

```
┌─────────────────────────────────────────┐
│ createdAt (DESC)                        │
├─────────────────────────────────────────┤
│ Uses: Time-range queries, recent logs   │
│ Size: ~200MB for 1M rows               │
│ Query: SELECT * WHERE createdAt > ?     │
└─────────────────────────────────────────┘
```

### Secondary Indexes (Filtering)

```
┌─────────────────────────────────────────┐
│ entityType, entityId                    │
├─────────────────────────────────────────┤
│ Uses: Entity history lookups            │
│ Query: Get all changes for entity       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ action, severity                        │
├─────────────────────────────────────────┤
│ Uses: Alert/threat filtering            │
│ Query: Find all DELETE operations       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ actorId                                 │
├─────────────────────────────────────────┤
│ Uses: Admin activity tracking           │
│ Query: All logs by specific admin       │
└─────────────────────────────────────────┘
```

### Specialized Indexes

```
┌─────────────────────────────────────────┐
│ ipAddress                               │
├─────────────────────────────────────────┤
│ Uses: IP-based investigation            │
│ Query: Find all logs from IP            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ sessionId                               │
├─────────────────────────────────────────┤
│ Uses: Session tracking                  │
│ Query: All logs from session            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ module                                  │
├─────────────────────────────────────────┤
│ Uses: Module-level filtering            │
│ Query: All logs from Organizations      │
└─────────────────────────────────────────┘
```

---

## Scalability Strategy

### Current State (Up to 10M logs)

```
Table Size: 10-15GB (compressed)
Index Size: 2-3GB
Query Time: <500ms for complex queries
```

### Future (100M+ logs)

**Option 1: Time-Based Partitioning**

```sql
CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Option 2: Entity-Type Sharding**

```
audit_log_admin       -- Only admin logs
audit_log_org         -- Only organization logs
audit_log_credential  -- Only credential logs
```

**Option 3: Archive Strategy**

```
ACTIVE (current year):  Fast, indexed, in PostgreSQL
ARCHIVE (older):       Compressed, in S3/Cold storage
SEARCH:                Elasticsearch for full-text
```

---

## Query Examples

### Query 1: Get User Activity Timeline

```sql
SELECT id, action, description, createdAt
FROM "AuditLog"
WHERE actorId = $1
ORDER BY createdAt DESC
LIMIT 50;
```

**Index Used**: [actorId]

---

### Query 2: Get Changes to Specific Entity

```sql
SELECT id, action, oldValues, newValues, createdAt
FROM "AuditLog"
WHERE entityType = $1 AND entityId = $2
ORDER BY createdAt DESC;
```

**Index Used**: [entityType, entityId]

---

### Query 3: Find High-Risk Operations

```sql
SELECT id, description, riskScore, createdAt
FROM "AuditLog"
WHERE severity IN ('HIGH', 'CRITICAL')
  AND createdAt >= $1
ORDER BY createdAt DESC
LIMIT 100;
```

**Index Used**: [severity, createdAt]

---

### Query 4: Detect Brute Force

```sql
SELECT COUNT(*), ipAddress
FROM "AuditLog"
WHERE action = 'FAILED_LOGIN'
  AND createdAt >= NOW() - INTERVAL '15 minutes'
GROUP BY ipAddress
HAVING COUNT(*) >= 5;
```

**Index Used**: [action, createdAt], [ipAddress]

---

## JSON Fields (Examples)

### oldValues / newValues

```json
{
  "status": "ACTIVE",
  "email": "old@example.com",
  "phone": "555-1111",
  "country": "USA"
}
```

### metadata

```json
{
  "method": "PATCH",
  "url": "/api/v1/organizations/uuid",
  "statusCode": 200,
  "query": {},
  "params": { "id": "uuid" }
}
```

---

**Version**: 1.0.0  
**Last Updated**: July 5, 2026  
**Status**: Production Ready
