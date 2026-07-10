# Audit System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT REQUEST                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │   setupAuditContext Middleware     │
        │  (Populate audit context)          │
        │  - Generate request ID             │
        │  - Extract IP address              │
        │  - Get User-Agent                  │
        │  - Store session ID                │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   protect (Auth) Middleware        │
        │  - Verify JWT token                │
        │  - Load admin user                 │
        │  - Check if active                 │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  Auto-Audit Middleware             │
        │  - Capture request data            │
        │  - Determine action type           │
        │  - Fetch old data (if update)      │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │     Controller Method              │
        │  - Process business logic          │
        │  - Access database                 │
        │  - Validate inputs                 │
        │  - Return response                 │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   Response Methods Override        │
        │  - res.json() intercepted          │
        │  - res.send() intercepted          │
        │  - Extract response data           │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   Async Audit Logging              │
        │  - Extract entity ID               │
        │  - Prepare metadata                │
        │  - Calculate risk score            │
        │  - Generate hash                   │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │     AuditService.logAudit()        │
        │  - Parse device info               │
        │  - Detect location                 │
        │  - Create snapshots                │
        │  - Check for alerts                │
        │  - Update activity summary         │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │    AuditRepository                 │
        │  - Database operations             │
        │  - Create audit log entry          │
        │  - Create snapshots                │
        │  - Create alerts if needed         │
        │  - Update activity summary         │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │     Database Tables                │
        │  ┌──────────────────────────────┐  │
        │  │  AuditLog (Main Table)       │  │
        │  │  - actorId, action, severity │  │
        │  │  - entity info, values       │  │
        │  │  - metadata, timestamps      │  │
        │  └──────────────────────────────┘  │
        │  ┌──────────────────────────────┐  │
        │  │  AuditSnapshot               │  │
        │  │  - Point-in-time data        │  │
        │  └────────────────────────