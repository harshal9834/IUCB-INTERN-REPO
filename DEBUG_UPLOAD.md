# DEBUG: Bulk Email Upload HTTP 400

## Issue
Backend returns HTTP 400 when uploading Excel file with campaign name.

## Root Cause Analysis

### STEP 1: Frontend FormData Construction ✅
- **File:** `frontend/src/services/api/bulk-email-campaign.api.ts`
- **Line:** 37-39
- **Status:** CORRECT
  ```typescript
  const formData = new FormData();
  formData.append("file", file);
  formData.append("campaignName", campaignName);
  ```

### STEP 2: Backend Route Configuration ✅
- **File:** `backend/src/routes/bulk-email-campaign.routes.ts`
- **Line:** 93-99
- **Status:** CORRECT
  ```typescript
  router.post(
    "/upload", 
    uploadExcel.single("file"),  // Captures file + other FormData fields
    handleMulterError,
    ctrl.uploadExcel
  );
  ```

### STEP 3: Multer Configuration ✅
- **File:** `backend/src/routes/bulk-email-campaign.routes.ts`
- **Line:** 57-62
- **Status:** CORRECT
  ```typescript
  const uploadExcel = multer({ 
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
  });
  ```

### STEP 4: THE PROBLEM - FormData Fields Not Reaching req.body

**Expected:**
- `req.file` = { filename: "...", originalname: "..." }
- `req.body` = { campaignName: "..." }

**What Happens with Multer:**
Multer's `.single()` method SHOULD automatically put non-file FormData fields into `req.body`. However, this depends on:

1. **Request order**: File vs FormData fields
2. **Multer behavior**: Some versions don't parse fields automatically
3. **Express middleware order**: Body parser interference

### STEP 5: Solution

The issue is likely that **Multer is extracting the file but not parsing the other FormData fields into req.body**.

**FIX:** Explicitly use Multer's field parser in addition to file parser:

```typescript
// WRONG (currently):
upload.single("file")  // Only captures file

// CORRECT (should be):
upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'campaignName', maxCount: 1 }
])

// OR use middleware to manually parse fields:
upload.single("file").fields([...])
```

## Debugging Output

To capture debugging output, the controller now logs:
- `req.body` - should contain { campaignName: "..." }
- `req.file` - should contain file details
- `req.files` - should be undefined when using .single()

Check server logs after attempting upload to see what's actually received.

## Expected Console Output When Upload Succeeds

```
╔════════════════════════════════════════════════════════════════╗
║              UPLOAD EXCEL - REQUEST DEBUG                    ║
╚════════════════════════════════════════════════════════════════╝
req.body: { campaignName: "Test Campaign" }
req.file: { fieldname: 'file', originalname: 'test.xlsx', path: '...' }
req.files: UNDEFINED
────────────────────────────────────────────────────────────────

Extracted campaignName: Test Campaign Type: string
✅ File saved successfully: ...
✅ File size: XXX KB
Processing Excel file...
✅ Excel parsing complete: Total=XX, Valid=XX, Invalid=XX
✅ Relative path for DB: storage/uploads/...
```

## Next Step

Modify routes to properly parse FormData fields with Multer.

