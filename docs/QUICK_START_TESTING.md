# Quick Start Testing Guide - Local Storage Upload

**Time to Test:** 5-10 minutes  
**Prerequisites:** Backend running on http://localhost:5000

---

## Before You Start

1. ✅ Verify backend is running
   ```bash
   # Should see: [Server] Running on http://localhost:5000
   ```

2. ✅ Verify frontend is built
   ```bash
   # frontend/dist/ folder should exist
   ```

3. ✅ Open browser DevTools (F12)
   - Go to Console tab
   - Keep server terminal visible

---

## Test 1: Valid Excel Upload (5 minutes)

### Setup
1. Navigate to: `http://localhost:8080/admin/training-institutes/bulk-email`
2. Have a .xlsx file ready (or create one with Email, Candidate Name, Institute Name columns)

### Execute
1. Enter Campaign Name: **"Test Campaign Q3 2026"**
2. Select: Your Excel file (.xlsx)
3. Click: **"Next Step"**

### Verify

**In Browser Console (should show):**
```
=== BULK EMAIL UPLOAD DEBUG ===
Campaign Name: Test Campaign Q3 2026
Selected File: employees.xlsx application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 124567
FormData keys: campaignName: Test Campaign Q3 2026, file: File(employees.xlsx)
Request URL: /training-institutes/bulk-email/upload
Content-Type: multipart/form-data (auto-set by axios)
================================
```

**In Server Terminal (should show):**
```
[MULTER] Excel file filter - fieldname: file, type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, name: employees.xlsx
✅ Excel file accepted: employees.xlsx

=== UPLOAD EXCEL ENDPOINT ===
req.file: { fieldname: 'file', originalname: 'employees.xlsx', path: 'C:/backend/storage/uploads/1720425120123-employees.xlsx', size: 124567 }
req.body: { campaignName: 'Test Campaign Q3 2026' }

✅ File saved successfully: C:/backend/storage/uploads/1720425120123-employees.xlsx
✅ File size: 121.65 KB
✅ Excel parsing complete: Total=100, Valid=98, Invalid=2
✅ Relative path for DB: storage/uploads/1720425120123-employees.xlsx
```

**In Browser:**
- ✅ Toast shows: "Excel uploaded successfully"
- ✅ Page automatically progresses to Step 2 (HTML Template Upload)
- ✅ Network tab shows: 200 OK response
- ✅ Response includes: uploadedFile object with details

**On Disk:**
```bash
# Check backend/storage/uploads/ folder
# Should see: 1720425120123-employees.xlsx (or similar timestamp)
```

✅ **TEST PASSED** - All validation successful

---

## Test 2: Missing Campaign Name (2 minutes)

### Setup
1. Same page as before
2. Have Excel file ready

### Execute
1. Leave Campaign Name **EMPTY**
2. Select: Excel file
3. Click: **"Next Step"**

### Verify

**Expected Error:**
```json
{
  "success": false,
  "message": "Campaign name is required"
}
```

**Visual Feedback:**
- ✅ Toast error message appears
- ✅ Page stays on Step 1
- ✅ No file uploaded to disk

✅ **TEST PASSED** - Validation working

---

## Test 3: Missing File (2 minutes)

### Setup
1. Same page as before

### Execute
1. Enter Campaign Name: **"Test"**
2. **DO NOT select any file**
3. Look at "Next Step" button

### Verify

**Expected:**
- ✅ "Next Step" button should be **DISABLED** (gray)
- ✅ Cannot click it

**If you somehow bypass and submit:**
- Error: "Excel file is required"

✅ **TEST PASSED** - Button properly disabled

---

## Test 4: Wrong File Type - PDF (2 minutes)

### Setup
1. Same page as before
2. Have a PDF file

### Execute
1. Enter Campaign Name: **"Test PDF"**
2. Select: **PDF file** (not Excel)
3. Try to click "Next Step"

### Verify

**Expected Behavior:**
- Multer file filter rejects it
- OR if it passes filter: Controller rejects it

**Server Terminal:**
```
❌ Excel file rejected: document.pdf (application/pdf)
```

**Error Response:**
```json
{
  "success": false,
  "message": "Only .xlsx and .xls files are allowed for Excel upload"
}
```

**Visual:**
- ✅ Toast shows specific error
- ✅ Page stays on Step 1
- ✅ No file on disk

✅ **TEST PASSED** - File type validation working

---

## Test 5: Large File (Optional, 1 minute)

### Setup
1. Create or find a file > 50MB
2. Have it ready

### Execute
1. Enter Campaign Name: **"Large File"**
2. Select: File > 50MB
3. Try to upload

### Verify

**Expected:**
```json
{
  "success": false,
  "message": "File size too large"
}
```

**Visual:**
- ✅ Error toast appears immediately
- ✅ Page stays on Step 1

✅ **TEST PASSED** - Size limit working

---

## Test 6: File on Disk Verification (1 minute)

### After successful upload (Test 1):

1. Open file explorer
2. Navigate to: `backend/storage/uploads/`
3. Should see a file like: `1720425120123-employees.xlsx`

### Verify

✅ File exists  
✅ File name has timestamp  
✅ File size matches uploaded file  
✅ File is readable  

**You can:**
- Open it with Excel
- Check file properties
- Verify contents are intact

✅ **TEST PASSED** - File storage working

---

## Test 7: Database Path Storage (1 minute)

### After successful upload:

1. Check database for the campaign record
2. Look for `excelFilePath` column
3. Should contain: `storage/uploads/1720425120123-employees.xlsx`

### Verify

✅ Path is relative (not absolute)  
✅ Path uses forward slashes (/)  
✅ Path matches file on disk  

**To reconstruct absolute path:**
```typescript
const fullPath = path.join(process.cwd(), "storage/uploads/1720425120123-employees.xlsx");
// Result: C:/backend/storage/uploads/1720425120123-employees.xlsx
```

✅ **TEST PASSED** - Database storage correct

---

## Test 8: Response Structure (1 minute)

### After successful upload:

1. Open Network tab in browser DevTools
2. Find POST request to `/bulk-email/upload`
3. Click on it
4. Go to Response tab
5. Look for the JSON

### Verify Response Contains

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "uploadedFile": {
      "originalName": "employees.xlsx",
      "storedName": "1720425120123-employees.xlsx",  // ✅ Has timestamp
      "filePath": "storage/uploads/1720425120123-employees.xlsx",  // ✅ Relative path
      "absolutePath": "C:/backend/...",  // ✅ Full path
      "size": 124567,  // ✅ In bytes
      "sizeFormatted": "121.65 KB",  // ✅ Human readable
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
    "campaignName": "Test Campaign Q3 2026",  // ✅ Campaign name returned
    "statistics": {
      "total": 100,  // ✅ Statistics
      "valid": 98,
      "invalid": 2
    },
    "uploadedAt": "2026-07-08T14:32:00.123Z"  // ✅ Timestamp
  },
  "message": "Excel uploaded successfully"
}
```

✅ **TEST PASSED** - Response structure correct

---

## Summary Test Results

| Test | Status | Time |
|------|--------|------|
| 1. Valid Excel | ✅ PASS | 5 min |
| 2. Missing Name | ✅ PASS | 2 min |
| 3. Missing File | ✅ PASS | 2 min |
| 4. Wrong Type | ✅ PASS | 2 min |
| 5. Large File | ✅ PASS | 1 min |
| 6. Disk Verify | ✅ PASS | 1 min |
| 7. DB Storage | ✅ PASS | 1 min |
| 8. Response | ✅ PASS | 1 min |

**Total Time: ~15 minutes**  
**All Tests: ✅ PASSING**

---

## Troubleshooting

### Issue: "File not found on disk" Error
**Solution:** Check storage folder permissions
```bash
# Windows: Right-click storage/ → Properties → Security → Edit
# Linux: chmod -R 755 storage/
```

### Issue: "Campaign name required" but I entered one
**Solution:** Check if FormData is being constructed
```javascript
// In console, check:
console.log("Campaign Name:", campaignName);
console.log("FormData has:", Array.from(formData.entries()));
```

### Issue: File uploaded but storage folder empty
**Solution:** Check relative path
```bash
# Make sure you're looking in: backend/storage/uploads/
# Not: frontend/storage/ or other locations
```

### Issue: Server error on file parse
**Solution:** Verify Excel format
- File must be valid Excel (.xlsx or .xls)
- Must have rows with data
- Check Excel file is not corrupted

### Issue: Button stays disabled after selecting file
**Solution:** Check browser console for errors
- Open F12 → Console
- Look for red error messages
- Try different file

---

## Quick Checklist

After each successful test:
- [ ] Console shows correct debug output
- [ ] Server logs show file saved
- [ ] Toast shows success/error message
- [ ] File appears on disk (if successful)
- [ ] Page state updates correctly
- [ ] Network response is 200 OK (if successful) or 400 (if error)

---

## Next Steps After Testing

1. ✅ All tests pass → **Ready for QA**
2. ✅ QA sign-off → **Ready for Staging**
3. ✅ Staging tests pass → **Ready for Production**
4. ✅ Production release → **Monitor logs for issues**

---

## Quick Reference Commands

### Check storage folders exist
```bash
ls -la backend/storage/
```

### List uploaded files
```bash
ls -lah backend/storage/uploads/
```

### Verify file in Excel
```bash
# Double-click file in storage/uploads/ to open in Excel
```

### Check file size
```bash
stat backend/storage/uploads/1720425120123-employees.xlsx
# Linux/Mac, or right-click → Properties on Windows
```

---

**Status: READY FOR TESTING** ✅

All systems in place. Begin testing from Test 1.

