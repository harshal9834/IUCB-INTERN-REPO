# Bulk Email Upload - Quick Reference

**Status:** ✅ FIXED - Ready to Test  
**Date:** July 8, 2026

---

## The Problem (Before)
When clicking "Next Step" → **400 Bad Request** with no clear error message

## The Solution (After)
✅ File validation  
✅ File size limits  
✅ Clear error messages  
✅ Comprehensive logging  

---

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `frontend/src/services/api/bulk-email-campaign.api.ts` | Added console.log debug statements | Shows what frontend is sending |
| `backend/src/routes/bulk-email-campaign.routes.ts` | Enhanced multer with fileFilter & limits | Validates file type before controller |
| `backend/src/controllers/bulk-email-campaign.controller.ts` | Added detailed logging & validation | Shows exactly what backend receives |

---

## How to Test

### 1. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Open Application
Navigate to: `http://localhost:8080/admin/training-institutes/bulk-email`

### 3. Test Upload
1. Enter campaign name
2. Select .xlsx file
3. Click "Next Step"

### 4. Check Console

**Frontend Console (Browser DevTools)**
```
=== BULK EMAIL UPLOAD DEBUG ===
Campaign Name: (not sent in upload - sent in startCampaign)
Selected File: employees.xlsx application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 124567
FormData keys: file: File(employees.xlsx)
Request URL: /training-institutes/bulk-email/upload
Content-Type: multipart/form-data (auto-set by axios)
================================
```

**Backend Console**
```
[MULTER] Excel file filter - fieldname: file, type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, name: employees.xlsx
✅ Excel file accepted: employees.xlsx

=== UPLOAD EXCEL ENDPOINT ===
req.file: { 
  fieldname: 'file', 
  originalname: 'employees.xlsx', 
  mimetype: '...' , 
  size: 124567 
}
...
✅ File validation passed. Processing Excel...
✅ Excel parsing complete: Total=100, Valid=98, Invalid=2
```

---

## Expected Outcomes

### ✅ Success (Valid Excel)
- Response: **200 OK**
- Toast: "Excel uploaded successfully"
- Auto-proceeds to Step 2

### ❌ PDF File
- Response: **400 Bad Request**
- Message: "Only .xlsx and .xls files are allowed for Excel upload"
- Stays on Step 1

### ❌ File > 50MB
- Response: **400 Bad Request**
- Message: "File size too large"
- Stays on Step 1

### ❌ No File
- Button disabled automatically
- Can't proceed

---

## Key Changes Explained

### Frontend
```typescript
// Logs exactly what's being sent
console.log("FormData keys:", Array.from(formData.entries())...);
```

### Backend Multer
```typescript
// Validates file BEFORE controller
const excelFileFilter = (req, file, cb) => {
  if (file is Excel) cb(null, true);
  else cb(new Error("Only .xlsx..."));
};
```

### Backend Controller
```typescript
// Logs what's received + validates again
console.log("req.file:", req.file);
if (!allowedExtensions.includes(fileExt)) {
  throw new ApiError(400, "Unsupported file type...");
}
```

---

## Error Response Examples

### Missing File
```json
{
  "success": false,
  "message": "Excel file is required"
}
```

### Wrong Type
```json
{
  "success": false,
  "message": "Only .xlsx and .xls files are allowed for Excel upload"
}
```

### Too Large
```json
{
  "success": false,
  "message": "File size too large"
}
```

---

## Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "filePath": "storage/templates/1720425120123-employees.xlsx",
    "total": 100,
    "valid": 98,
    "invalid": 2
  },
  "message": "Excel uploaded successfully"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting 400 | Verify files were rebuilt: `npm run build` |
| No console logs | Check DevTools is open (F12) in correct tab |
| Server crashing | Kill node: `Get-Process node \| Stop-Process -Force` |
| Can't upload | Check file is .xlsx and size < 50MB |
| "File required" error | Actually select a file before clicking Next |

---

## Architecture

```
User selects file
        ↓
Click "Next Step" button
        ↓
Frontend logs: "FormData keys: file: File(...)"
        ↓
POST /api/v1/training-institutes/bulk-email/upload
        ↓
Backend logs: "[MULTER] Excel file filter"
        ↓
Validate file type → Excel accepted ✓
        ↓
Backend logs: "req.file: { fieldname: 'file'... }"
        ↓
Validate extension → .xlsx approved ✓
        ↓
Parse Excel → Get stats (total, valid, invalid)
        ↓
Response 200 OK + filePath
        ↓
Frontend toast: "Excel uploaded successfully"
        ↓
Auto-progress to Step 2 (HTML Template)
```

---

## What NOT to Do

❌ Don't manually set Content-Type header in axios  
❌ Don't send campaignName in file upload (send in Step 5)  
❌ Don't change field name from "file"  
❌ Don't remove the handleMulterError middleware  
❌ Don't increase file size limit without discussion  

---

## What WAS Fixed

✅ Added file type validation  
✅ Added file size limits (50MB Excel, 10MB HTML)  
✅ Added error handling middleware  
✅ Added console logging on both sides  
✅ Added clear error messages  
✅ Separated multer instances for different file types  

---

## Next Actions

1. **Rebuild both apps**
2. **Start both servers**
3. **Test upload with valid Excel**
4. **Check console logs match expected**
5. **Verify Step 2 loads** (Template Upload)
6. **Test error cases** (wrong file type, too large, etc.)

---

## Status Codes Summary

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | Success | File uploaded & parsed successfully |
| 400 | Bad Request | Invalid file type, size, or missing |
| 401 | Unauthorized | No valid JWT token |
| 500 | Server Error | Excel parsing or other backend error |

---

## Debug Endpoints

All endpoints use authentication. Ensure valid JWT token in Authorization header:
```
Authorization: Bearer <valid_token_here>
```

Upload Excel:
```
POST /api/v1/training-institutes/bulk-email/upload
```

Upload HTML Template:
```
POST /api/v1/training-institutes/bulk-email/template
```

Get Campaign List:
```
GET /api/v1/training-institutes/bulk-email
```

---

**Questions?** Check the detailed implementation guide:  
`BULK_EMAIL_UPLOAD_IMPLEMENTATION_GUIDE.md`

**Full debug report:**  
`BULK_EMAIL_UPLOAD_DEBUG_REPORT.md`

