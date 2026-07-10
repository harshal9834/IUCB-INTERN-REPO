# Certificate Storage Guide

## 📍 Overview

Certificates in the IUCB system are stored in two locations:

1. **File System**: Physical PDF files stored in server disk
2. **Database**: Metadata stored in PostgreSQL with path references

---

## 🗂️ File Storage Location

### Directory Path
```
backend/storage/certificates/
```

### Full Absolute Path
```
<PROJECT_ROOT>/backend/storage/certificates/
```

### File Structure Example
```
backend/
├── storage/
│   └── certificates/
│       ├── CRED-083868-388.pdf
│       ├── CRED-126096-781.pdf
│       ├── IUCB-ADV-000001.pdf
│       ├── IUCB-ADV-000002.pdf
│       └── IUCB-ORG-000001.pdf
```

---

## 🏗️ How Certificates Are Stored

### Step 1: Generate Certificate (Backend)
```typescript
// File: backend/src/controllers/credentials.controller.ts

function getStorageDir(): string {
  const dir = path.join(process.cwd(), "storage", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Generate PDF and save to file system
const storageDir = getStorageDir();
const filename = `${credential.credentialId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
const filePath = path.join(storageDir, filename);
fs.writeFileSync(filePath, pdfBuffer);

// Store database reference
const dbPath = `/storage/certificates/${filename}`;
```

### Step 2: Save to Database
```typescript
// Database record in Credential table
const updated = await db.credential.update({
  where: { id },
  data: {
    certificateGenerated: true,
    certificatePath: dbPath,           // Stored path: /storage/certificates/CRED-xxxxx.pdf
    generatedAt: new Date(),
    generatedById: req.admin.id,
  },
});
```

### Step 3: Retrieve and Serve
```typescript
// When viewing/downloading certificate
const filename = path.basename(credential.certificatePath);
const absolutePath = path.join(
  process.cwd(), 
  credential.certificatePath.replace(/^\//, "")
);

// Send file to frontend with JWT auth
fs.readFileSync(absolutePath);
```

---

## 🗄️ Database Schema

### Credential Table Fields

```sql
CREATE TABLE Credential (
  -- ... other fields
  
  certificateGenerated Boolean          @default(false)
  certificatePath      String?          -- Path: /storage/certificates/filename.pdf
  generatedAt          DateTime?        -- When generated
  generatedById        String?          -- Admin who generated it
  
  -- ... relationships
  generatedBy          Admin?           -- Reference to generating admin
);
```

### Indexed Fields
- `certificateGenerated`: Boolean index for filtering
- `certificatePath`: String for file lookup

---

## 📝 Certificate Naming Convention

### Format
```
{CREDENTIAL_ID}.pdf
```

### Examples
```
CRED-083868-388.pdf         (Credential)
IUCB-ADV-000001.pdf         (Advisor)
IUCB-ORG-000001.pdf         (Organization)
```

### Generation Logic
```typescript
const filename = `${credential.credentialId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
// Removes special characters and 