# AUDIT LOGGING API - COMPLETE ENDPOINT REFERENCE

**Base URL**: `http://localhost:5000/api/v1/audit`  
**Authentication**: Required (JWT Bearer Token)  
**Content-Type**: `application/json`

---

## Table of Contents

1. [Audit Logs](#audit-logs)
2. [Entity History](#entity-history)
3. [Dashboard & Statistics](#dashboard--statistics)
4. [Security Alerts](#security-alerts)
5. [Integrity Verification](#integrity-verification)
6. [Filter Reference](#filter-reference)

---

## AUDIT LOGS

### 1. Get Audit Logs (Paginated)

```http
GET /logs
```

**Description**: Retrieve audit logs with advanced filtering and pagination

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination |
| limit | integer | No | 20 | Records per page (max: 100) |
| actorId | string | No | - | Filter by admin UUID |
| entityType | string | No | - | Filter by entity type |
| action | string | No | - | Filter by action (CREATE, UPDATE, etc.) |
| module | string | No | - | Filter by module (Authentication, Credentials, etc.) |
| severity | string | No | - | Filter by severity (LOW, MEDIUM, HIGH, CRITICAL) |
| status | string | No | - | Filter by status (SUCCESS, FAILED) |
| dateFrom | ISO 8601 | No | - | Start date (2026-07-01) |
| dateTo | ISO 8601 | No | - | End date (2026-07-05) |
| ipAddress | string | No | - | Filter by IP address |
| sessionId | string | No | - | Filter by session UUID |
| search | string | No | - | Full-text search in description |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/logs?page=1&limit=20&severity=HIGH&dateFrom=2026-07-01&dateTo=2026-07-05" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "logs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "actorId": "550e8400-e29b-41d4-a716-446655440001",
        "actorName": "John Doe",
        "actorRole": "SUPER_ADMIN",
        "entityType": "Organization",
        "entityId": "550e8400-e29b-41d4-a716-446655440002",
        "action": "UPDATE",
        "module": "Organizations",
        "description": "Updated organization status from ACTIVE to SUSPENDED",
        "oldValues": { "status": "ACTIVE" },
        "newValues": { "status": "SUSPENDED" },
        "metadata": { "reason": "License expired" },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "device": "Desktop",
        "browser": "Chrome 126.0",
        "os": "Windows 10",
        "country": "United States",
        "city": "New York",
        "sessionId": "550e8400-e29b-41d4-a716-446655440003",
        "requestId": "550e8400-e29b-41d4-a716-446655440004",
        "status": "SUCCESS",
        "severity": "MEDIUM",
        "riskScore": 5,
        "createdAt": "2026-07-05T10:30:00.000Z",
        "actor": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "fullName": "John Doe",
          "email": "john@iucb.org",
          "role": "SUPER_ADMIN"
        },
        "alerts": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "totalPages": 250,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Audit logs retrieved successfully"
}
```

**Error Responses**:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only Super Admins can access all logs"
}
```

---

### 2. Get Single Audit Log

```http
GET /logs/:id
```

**Description**: Retrieve detailed information about a specific audit log

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Audit log UUID |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/logs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actorId": "550e8400-e29b-41d4-a716-446655440001",
    "actorName": "John Doe",
    "entityType": "Organization",
    "entityId": "550e8400-e29b-41d4-a716-446655440002",
    "action": "UPDATE",
    "description": "Updated organization details",
    "oldValues": {
      "name": "Old Organization Name",
      "status": "ACTIVE",
      "email": "old@org.com"
    },
    "newValues": {
      "name": "New Organization Name",
      "status": "SUSPENDED",
      "email": "new@org.com"
    },
    "metadata": {
      "method": "PATCH",
      "url": "/api/v1/organizations/550e8400-e29b-41d4-a716-446655440002",
      "statusCode": 200,
      "userAgent": "Mozilla/5.0...",
      "query": {},
      "params": { "id": "550e8400-e29b-41d4-a716-446655440002" }
    },
    "snapshots": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "entityType": "Organization",
        "entityId": "550e8400-e29b-41d4-a716-446655440002",
        "snapshot": { "...": "..." },
        "timestamp": "2026-07-05T10:30:00.000Z"
      }
    ],
    "alerts": [],
    "createdAt": "2026-07-05T10:30:00.000Z"
  },
  "message": "Audit log retrieved successfully"
}
```

**Error Responses**:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Audit log not found"
}
```

---

### 3. Search Audit Logs

```http
GET /logs/search
```

**Description**: Full-text search across audit logs

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Search term (description, admin name, entity type) |
| limit | integer | No | 20 | Max results (max: 100) |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/logs/search?query=organization&limit=50" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "entityType": "Organization",
      "description": "Updated organization status",
      "...": "..."
    }
  ],
  "message": "Search results retrieved successfully"
}
```

---

## ENTITY HISTORY

### Get Complete Change History

```http
GET /history/:entityType/:entityId
```

**Description**: Retrieve all audit logs for a specific entity (complete change history)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entityType | string | Yes | Entity type (Organization, Credential, Admin) |
| entityId | UUID | Yes | Entity UUID |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/history/Organization/550e8400-e29b-41d4-a716-446655440002" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "action": "CREATE",
      "description": "Created new organization",
      "createdAt": "2026-07-01T08:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "action": "UPDATE",
      "description": "Updated organization details",
      "oldValues": { "email": "old@org.com" },
      "newValues": { "email": "new@org.com" },
      "createdAt": "2026-07-02T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "UPDATE",
      "description": "Updated organization status",
      "oldValues": { "status": "ACTIVE" },
      "newValues": { "status": "SUSPENDED" },
      "createdAt": "2026-07-05T10:30:00.000Z"
    }
  ],
  "message": "Entity history retrieved successfully"
}
```

---

## DASHBOARD & STATISTICS

### Get Dashboard Data

```http
GET /dashboard
```

**Description**: Comprehensive dashboard data with period selection

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | string | No | 7d | Period: 24h, 7d, 30d, 90d |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/dashboard?period=30d" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "period": "30d",
    "dateRange": {
      "from": "2026-06-05T00:00:00.000Z",
      "to": "2026-07-05T23:59:59.999Z"
    },
    "stats": {
      "totalLogs": 15000,
      "logsByAction": [
        { "action": "CREATE", "_count": { "action": 5000 } },
        { "action": "UPDATE", "_count": { "action": 8000 } },
        { "action": "DELETE", "_count": { "action": 1000 } },
        { "action": "LOGIN", "_count": { "action": 1000 } }
      ],
      "logsBySeverity": [
        { "severity": "LOW", "_count": { "severity": 10000 } },
        { "severity": "MEDIUM", "_count": { "severity": 4000 } },
        { "severity": "HIGH", "_count": { "severity": 900 } },
        { "severity": "CRITICAL", "_count": { "severity": 100 } }
      ],
      "logsByModule": [
        { "module": "Organizations", "_count": { "module": 5000 } },
        { "module": "Credentials", "_count": { "module": 4000 } },
        { "module": "Authentication", "_count": { "module": 3000 } }
      ],
      "activeAlerts": 12,
      "criticalAlerts": 2,
      "failedLogins": 45
    },
    "mostActiveAdmins": [
      {
        "actorId": "550e8400-e29b-41d4-a716-446655440001",
        "actorName": "John Doe",
        "_count": { "actorId": 500 }
      }
    ],
    "recentActivity": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "entityType": "Organization",
        "action": "UPDATE",
        "createdAt": "2026-07-05T10:30:00.000Z"
      }
    ],
    "activeAlerts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440006",
        "alertType": "MULTIPLE_FAILED_LOGINS",
        "severity": "HIGH",
        "title": "Multiple Failed Login Attempts",
        "status": "ACTIVE"
      }
    ],
    "summary": {
      "totalLogs": 15000,
      "criticalAlerts": 2,
      "failedLogins": 45,
      "activeAdmins": 1
    }
  },
  "message": "Dashboard data retrieved successfully"
}
```

---

### Get Audit Statistics

```http
GET /stats
```

**Description**: Audit statistics and breakdowns

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dateFrom | ISO 8601 | No | Start date |
| dateTo | ISO 8601 | No | End date |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/stats?dateFrom=2026-07-01&dateTo=2026-07-05" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalLogs": 5000,
    "logsByAction": [...],
    "logsBySeverity": [...],
    "logsByModule": [...],
    "activeAlerts": 12,
    "criticalAlerts": 2,
    "failedLogins": 45
  }
}
```

---

### Get Analytics Data

```http
GET /analytics
```

**Description**: Analytics data suitable for charting

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | string | No | 30d | Period: 7d, 30d, 90d, 1y |
| groupBy | string | No | day | Grouping: hour, day, week, month |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/analytics?period=30d&groupBy=day" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "period": "30d",
    "groupBy": "day",
    "dateRange": {
      "from": "2026-06-05T00:00:00.000Z",
      "to": "2026-07-05T23:59:59.999Z"
    },
    "timeSeriesData": [
      { "time": "2026-06-05", "count": 100 },
      { "time": "2026-06-06", "count": 150 },
      { "time": "2026-06-07", "count": 200 }
    ],
    "actionDistribution": [
      { "action": "CREATE", "count": 5000 },
      { "action": "UPDATE", "count": 8000 },
      { "action": "DELETE", "count": 1000 }
    ],
    "moduleDistribution": [
      { "module": "Organizations", "count": 5000 },
      { "module": "Credentials", "count": 4000 }
    ],
    "severityDistribution": [
      { "severity": "LOW", "count": 10000 },
      { "severity": "MEDIUM", "count": 4000 },
      { "severity": "HIGH", "count": 900 },
      { "severity": "CRITICAL", "count": 100 }
    ],
    "totalLogs": 15000,
    "stats": { "...": "..." }
  }
}
```

---

### Get Activity Timeline

```http
GET /timeline
```

**Description**: Recent activity timeline

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 50 | Max records |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/timeline?limit=50" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "actorName": "John Doe",
      "action": "UPDATE",
      "entityType": "Organization",
      "description": "Updated organization details",
      "createdAt": "2026-07-05T10:30:00.000Z"
    }
  ]
}
```

---

### Get Most Active Admins

```http
GET /active-admins
```

**Description**: List of most active administrators

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 10 | Max admins |
| dateFrom | ISO 8601 | No | - | Start date |
| dateTo | ISO 8601 | No | - | End date |

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/active-admins?limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "actorId": "550e8400-e29b-41d4-a716-446655440001",
      "actorName": "John Doe",
      "_count": { "actorId": 500 }
    }
  ]
}
```

---

## SECURITY ALERTS

### Get Active Alerts

```http
GET /alerts
```

**Description**: Retrieve active security alerts

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/alerts" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "alertType": "MULTIPLE_FAILED_LOGINS",
      "severity": "HIGH",
      "title": "Multiple Failed Login Attempts",
      "description": "5 failed login attempts from IP 192.168.1.100 in the last 15 minutes",
      "status": "ACTIVE",
      "metadata": {
        "ipAddress": "192.168.1.100",
        "attemptCount": 5,
        "timeWindow": "15 minutes"
      },
      "auditLog": {
        "id": "550e8400-e29b-41d4-a716-446655440007",
        "entityType": "Admin",
        "entityId": "admin@iucb.org",
        "action": "FAILED_LOGIN"
      },
      "assignee": null,
      "resolver": null,
      "createdAt": "2026-07-05T10:30:00.000Z"
    }
  ]
}
```

---

### Acknowledge Alert

```http
PATCH /alerts/:id/acknowledge
```

**Description**: Mark alert as acknowledged

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Alert UUID |

**Example Request**:

```bash
curl -X PATCH "http://localhost:5000/api/v1/audit/alerts/550e8400-e29b-41d4-a716-446655440006/acknowledge" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "status": "ACKNOWLEDGED",
    "assignedTo": "550e8400-e29b-41d4-a716-446655440001",
    "updatedAt": "2026-07-05T11:00:00.000Z"
  }
}
```

---

### Resolve Alert

```http
PATCH /alerts/:id/resolve
```

**Description**: Mark alert as resolved

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Alert UUID |

**Request Body**:

```json
{
  "resolution": "Confirmed safe after investigation"
}
```

**Example Request**:

```bash
curl -X PATCH "http://localhost:5000/api/v1/audit/alerts/550e8400-e29b-41d4-a716-446655440006/resolve" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"resolution": "False positive - authorized bulk operation"}'
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "status": "RESOLVED",
    "resolvedBy": "550e8400-e29b-41d4-a716-446655440001",
    "resolvedAt": "2026-07-05T11:00:00.000Z"
  }
}
```

---

## INTEGRITY VERIFICATION

### Verify Audit Integrity

```http
GET /integrity/verify
```

**Description**: Verify audit log hash chain (SUPER_ADMIN only)

**Example Request**:

```bash
curl "http://localhost:5000/api/v1/audit/integrity/verify" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Success Response (200)**:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isValid": true,
    "message": "Integrity verified",
    "blockCount": 5000,
    "lastVerified": "2026-07-05T10:30:00.000Z"
  }
}
```

**Error Response (403)**:

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only Super Admins can verify audit integrity"
}
```

---

## FILTER REFERENCE

### Severity Levels

```
LOW      - Routine operations (login, view, download)
MEDIUM   - Configuration changes (update, status change)
HIGH     - Sensitive operations (delete, role change)
CRITICAL - Security-critical (privilege escalation)
```

### Actions

```
CREATE              DELETE              STATUS_CHANGE
UPDATE              LOGIN               APPROVE
DELETE              LOGOUT              REJECT
FAILED_LOGIN        GENERATE            BULK_UPDATE
PASSWORD_CHANGE     SEND_EMAIL          BULK_DELETE
PASSWORD_RESET      DOWNLOAD            ROLE_CHANGE
PERMISSION_CHANGE   UPLOAD              EXPORT
IMPORT              CREATE              UPDATE
```

### Alert Types

```
MULTIPLE_FAILED_LOGINS    MASS_DELETE
UNUSUAL_LOCATION          MASS_UPDATE
PRIVILEGE_ESCALATION      BRUTE_FORCE
SECURITY_BREACH           INTEGRITY_VIOLATION
SYSTEM_ERROR
```

### Alert Status

```
ACTIVE        - Requires immediate attention
ACKNOWLEDGED  - Admin has reviewed
RESOLVED      - Issue resolved or confirmed safe
DISMISSED     - False positive
```

---

## ERROR CODES

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad request | Check query parameters and request body |
| 401 | Authentication required | Provide valid JWT token |
| 403 | Permission denied | Use SUPER_ADMIN token or check permissions |
| 404 | Not found | Verify ID/UUID is correct |
| 500 | Server error | Check server logs |

---

**API Version**: 1.0.0  
**Last Updated**: July 5, 2026  
**Status**: Production Ready
