# Credential ID Generation - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Admin Portal (Frontend)                     │
│                                                               │
│  Application Detail Page                                     │
│  ├─ Application #123 (ACCREDITATION)                        │
│  ├─ Status: APPROVED                                         │
│  └─ [Generate Credential Button]                            │
│                                                               │
│  Form Inputs (NO credentialNumber field):                    │
│  ├─ Standard: "ISO 9001:2015"                               │
│  ├─ Issue Date: "2026-02-10"                                │
│  ├─ Expiry Date: "2029-02-10"                               │
│  └─ [Submit Button]                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ POST /api/v1/credentials/generate
                           │ (NO credentialNumber in body)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend Credentials Controller                   │
│                                                               │
│  1. Validate Input                                           │
│  2. Find Application (type: ACCREDITATION)                   │
│  3. Call CredentialIdService.generateNextId(type)            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            CredentialIdService (Auto-Generation)             │
│                                                               │
│  generateNextId(ACCREDITATION)                              │
│  {                                                            │
│    1. Detect type → ACCREDITATION                           │
│    2. Get prefix → "IUCB-ORG"                               │
│    3. Query latest credential with IUCB-ORG prefix          │
│    4. Extract sequence from latest → 000021                 │
│    5. Increment → 000022                                    │
│    6. Generate ID → "IUCB-ORG-000022"                       │
│    7. Verify uniqueness ✓                                   │
│    8. Return → "IUCB-ORG-000022"                            │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                        │
│                                                               │
│  Credential Table                                            │
│  ├─ id: uuid                                                 │
│  ├─ credentialNumber: "IUCB-ORG-000022" ← AUTO-GENERATED   │
│  ├─ applicationId: (links to application)                    │
│  ├─ standard: "ISO 9001:2015"                               │
│  ├─ issueDate: 2026-02-10                                   │
│  ├─ expiryDate: 2029-02-10                                  │
│  └─ (unique constraint on credentialNumber)                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│        Response to Frontend (201 Created)                     │
│                                                               │
│  {                                                            │
│    credential: {                                             │
│      credentialNumber: "IUCB-ORG-000022" ← AUTO-GENERATED   │
│      standard: "ISO 9001:2015",                             │
│      issueDate: "2026-02-10",                               │
│      expiryDate: "2029-02-10",                              │
│      ...                                                      │
│    }                                                          │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Admin Portal (Frontend)                     │
│                                                               │
│  Credential Generated Successfully!                          │
│  ┌─────────────────────────────────────┐                    │
│  │ Credential ID (Read-Only)           │                    │
│  │ ┌───────────────────────────────┐   │                    │
│  │ │ IUCB-ORG-000022               │   │  ← Display auto-   │
│  │ │ (Cannot edit)                 │   │     generated ID   │
│  │ └───────────────────────────────┘   │                    │
│  │ [Copy to Clipboard] [Download PDF]  │                    │
│  └─────────────────────────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ID Generation Flow

### For ACCREDITATION (Organization)

```
Input: Approved Application (ACCREDITATION type)
       └─> Standard, Issue Date, Expiry Date

         ┌──────────────────────────────┐
         │  Get Application Type         │
         │  Type = ACCREDITATION         │
         └──────────────┬────────────────┘
                        │
         ┌──────────────▼────────────────┐
         │  Map to Prefix                │
         │  Prefix = IUCB-ORG            │
         └──────────────┬────────────────┘
                        │
         ┌──────────────▼────────────────┐
         │  Query Latest Credential      │
         │  WHERE credentialNumber       │
         │    LIKE 'IUCB-ORG%'          │
         │    AND deletedAt IS NULL      │
         │  ORDER BY createdAt DESC      │
         │  LIMIT 1                      │
         └──────────────┬────────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         Found               Not Found
              │                   │
    IUCB-ORG-000021      Start sequence
              │                   │
    Extract: 000021        Sequence = 1
              │                   │
    Add 1: 000022          Sequence = 1
              │                   │
         ┌────▼───────────────────▼──┐
         │  Generated ID              │
         │  IUCB-ORG-000022           │
         │  OR                        │
         │  IUCB-ORG-000001           │
         └────┬──────────────────────┘
              │
    ┌─────────▼────────────┐
    │ Verify Uniqueness    │
    │ SELECT COUNT(*)      │
    │ WHERE credentialNum  │
    │  = 'IUCB-ORG-000022' │
    │ Assert count = 0 ✓   │
    └─────────┬────────────┘
              │
    ┌─────────▼──────────────────┐
    │ Save to Database           │
    │ INSERT credentials         │
    │ VALUES (                   │
    │   credentialNumber:        │
    │     'IUCB-ORG-000022',    │
    │   applicationId: ...,      │
    │   standard: ...,           │
    │   ...                      │
    │ )                          │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │ Return ID to Controller    │
    │ 'IUCB-ORG-000022'          │
    └────────────────────────────┘

Output: IUCB-ORG-000022 ✓
        (Ready for display)
```

---

## Sequence Progression by Type

### Timeline Visualization

```
Time →

Organizations (IUCB-ORG):
├─ T1: IUCB-ORG-000001 created
├─ T3: IUCB-ORG-000002 created
├─ T5: IUCB-ORG-000003 created
├─ T7: IUCB-ORG-000004 created
└─ T8: IUCB-ORG-000005 created
       └─ Next will be: IUCB-ORG-000006

Auditors (IUCB-AUD):
├─ T2: IUCB-AUD-000001 created
├─ T4: IUCB-AUD-000002 created
└─ T6: IUCB-AUD-000003 created
       └─ Next will be: IUCB-AUD-000004

Training (IUCB-TI):
└─ T9: IUCB-TI-000001 created
       └─ Next will be: IUCB-TI-000002

Advisory (IUCB-ADV):
└─ T10: IUCB-ADV-000001 created
        └─ Next will be: IUCB-ADV-000002

Note: Each type has INDEPENDENT sequence
      Sequences DO NOT interfere with each other
```

---

## Data Deletion Scenario

```
Current State:
┌────────────────────────────┐
│ IUCB-ORG Credentials       │
├────────────────────────────┤
│ IUCB-ORG-000020 (VALID)    │
│ IUCB-ORG-000021 (DELETED)← │ deletedAt = 2026-02-15
│ IUCB-ORG-000022 (VALID)    │
│ IUCB-ORG-000023 (VALID)    │
└────────────────────────────┘

When generating new credential:

Query:
  WHERE credentialNumber LIKE 'IUCB-ORG%'
    AND deletedAt IS NULL              ← Filters out -000021
  ORDER BY createdAt DESC

Results (only non-deleted):
  ├─ IUCB-ORG-000023
  ├─ IUCB-ORG-000022
  └─ IUCB-ORG-000020

Latest: IUCB-ORG-000023
Extract: 000023
Add 1: 000024

Generated ID: IUCB-ORG-000024
              (NOT reusing 000021)

Key Point:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deleted credentials are SKIPPED
No ID is ever reused
Sequences only move FORWARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## UI Component Flow

### Frontend (React)

```jsx
// 1. Display Application Detail
const ApplicationDetail = ({ application }) => {
  // Application has type: ACCREDITATION
  
  // 2. Generate button clicked
  const handleGenerate = async () => {
    // NO credentialNumber field in request
    const response = await fetch('/api/v1/credentials/generate', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: application.id,
        standard: 'ISO 9001:2015',
        issueDate: '2026-02-10',
        expiryDate: '2029-02-10'
        // credentialNumber: ??? ← NOT HERE (auto-generated)
      })
    });
    
    // 3. Extract auto-generated ID
    const { credential } = await response.json().data;
    const credentialId = credential.credentialNumber;
    // credentialId = "IUCB-ORG-000022" ← AUTO-GENERATED
    
    // 4. Display in read-only field
    setGeneratedId(credentialId);
  };
  
  return (
    <div>
      <h2>Generate Credential</h2>
      <form>
        <input label="Standard" value={standard} onChange={...} />
        <input label="Issue Date" type="date" value={issueDate} />
        <input label="Expiry Date" type="date" value={expiryDate} />
        {/* NO credentialNumber field */}
        <button onClick={handleGenerate}>Generate</button>
      </form>
      
      {generatedId && (
        <div className="success-box">
          <label>Credential ID (Auto-Generated)</label>
          <input 
            type="text" 
            value={generatedId}  // "IUCB-ORG-000022"
            readOnly             // Cannot edit
            className="read-only"
          />
          <button onClick={() => copy(generatedId)}>Copy</button>
        </div>
      )}
    </div>
  );
};
```

---

## Database Query Examples

### Get Latest Organization Credential

```sql
SELECT credentialNumber, createdAt
FROM credentials
WHERE credentialNumber LIKE 'IUCB-ORG%'
  AND deletedAt IS NULL
ORDER BY createdAt DESC
LIMIT 1;

Result:
credentialNumber │ createdAt
─────────────────┼──────────────
IUCB-ORG-000022  │ 2026-02-15
```

### Get Next Auditor ID

```sql
-- Find latest
SELECT credentialNumber
FROM credentials
WHERE credentialNumber LIKE 'IUCB-AUD%'
  AND deletedAt IS NULL
ORDER BY createdAt DESC
LIMIT 1;

-- Extract sequence: 000008
-- Increment: 000008 + 1 = 000009
-- Generate: IUCB-AUD-000009
```

### Verify Uniqueness

```sql
SELECT COUNT(*) as count
FROM credentials
WHERE credentialNumber = 'IUCB-ORG-000022';

-- Should return: count = 0 (before insert)
-- After insert: count = 1 (verified unique)
```

---

## Request/Response Examples

### Request Body (What Admin Sends)

```json
{
  "applicationId": "550e8400-e29b-41d4-a716-446655440000",
  "standard": "ISO/IEC 27001:2022",
  "issueDate": "2026-02-10",
  "expiryDate": "2029-02-10",
  "auditorId": "550e8400-e29b-41d4-a716-446655440001",
  "internalNotes": "Notes about credential"
}

KEY: credentialNumber is NOT here ← Backend generates it
```

### Response (What Frontend Receives)

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "credential": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "credentialNumber": "IUCB-ORG-000022",  ← AUTO-GENERATED
      "standard": "ISO/IEC 27001:2022",
      "issueDate": "2026-02-10",
      "expiryDate": "2029-02-10",
      "status": "VALID",
      "createdAt": "2026-02-15T10:30:00Z"
    }
  },
  "message": "Credential generated successfully"
}

KEY: credentialNumber in response ← System generated it
```

---

## Error Scenarios

### Scenario 1: Missing Application ID

```
Request:
POST /api/v1/credentials/generate
{
  "standard": "ISO 9001:2015",
  "issueDate": "2026-02-10",
  "expiryDate": "2029-02-10"
  // Missing: applicationId
}

Response (400):
{
  "success": false,
  "statusCode": 400,
  "message": "Missing required fields"
}
```

### Scenario 2: Application Not Found

```
Request:
{
  "applicationId": "invalid-uuid-does-not-exist",
  ...
}

Response (404):
{
  "success": false,
  "statusCode": 404,
  "message": "Approved application not found"
}
```

### Scenario 3: Credential Already Generated

```
Request:
{
  "applicationId": "550e8400-...", ← Already has credential
  ...
}

Response (400):
{
  "success": false,
  "statusCode": 400,
  "message": "Credential already generated for this application"
}
```

---

## Type Mapping

```
Application Type              Prefix      Example
─────────────────────────────────────────────────────
ACCREDITATION      ──────→   IUCB-ORG  ──→ IUCB-ORG-000001
AUDITOR            ──────→   IUCB-AUD  ──→ IUCB-AUD-000001
TRAINING_INSTITUTE ──────→   IUCB-TI   ──→ IUCB-TI-000001
ADVISORY           ──────→   IUCB-ADV  ──→ IUCB-ADV-000001
```

---

## Summary Checklist

```
✅ Automatic Generation
   └─ No manual input allowed
   └─ ID generated by backend
   └─ System always creates valid ID

✅ IUCB Format Enforced
   └─ Always starts with IUCB-
   └─ Type-specific prefix
   └─ 6-digit zero-padded sequence

✅ Independent Sequences
   └─ Each type has own counter
   └─ Sequences don't interfere
   └─ Example: IUCB-ORG-000022 and IUCB-AUD-000003

✅ No Reset / No Reuse
   └─ Sequences always increment
   └─ Deleted IDs never reused
   └─ Guarantee: IUCB-ORG-000023 comes after -000022

✅ Unique Constraint
   └─ Database prevents duplicates
   └─ Service verifies before saving
   └─ Collision error never occurs in practice

✅ Frontend Integration Ready
   └─ Display as read-only
   └─ Copy to clipboard
   └─ Show in verification links
```
