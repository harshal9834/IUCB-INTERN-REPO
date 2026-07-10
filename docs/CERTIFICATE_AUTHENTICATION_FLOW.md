# Certificate Authentication Flow - Technical Reference

## Problem: Why Direct URLs Failed

```
❌ BEFORE (Broken)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. User clicks "View Certificate"
2. window.open("http://localhost:5000/api/v1/credentials/abc123/certificate/download?inline=true")
3. Browser opens new tab
4. Browser makes GET request to protected endpoint
5. ❌ No Authorization header included
6. Backend checks for token: NOT FOUND
7. Backend returns: 401 Unauthorized - Token Missing
8. User sees: Blank page or error
```

## Solution: Authenticated Blob Download

```
✅ AFTER (Fixed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. User clicks "View Certificate"
2. JavaScript calls: handleViewCertificate()
3. Function calls: credentialsApi.downloadCertificate(id, true)
4. Axios interceptor runs:
   - Retrieves JWT token from memory
   - Adds to request: Authorization: Bearer <JWT>
5. Request sent to: GET /credentials/{id}/certificate/download?inline=true
   Header: Authorization: Bearer eyJhbGc...
6. Backend checks token: ✅ VALID
7. Backend returns: PDF file as blob
8. Frontend creates: Blob URL (blob:http://localhost:5173/...)
9. window.open(blobUrl) → Opens in new tab
10. Browser renders PDF
11. Cleanup: window.URL.revokeObjectURL(blobUrl)
12. User sees: ✅ PDF opened in browser
```

## Data Flow Diagram

```
Frontend Component                 Axios Client                Backend
════════════════════════════════════════════════════════════════════════

User clicks button
    ↓
handleViewCertificate()
    ↓
credentialsApi.downloadCertificate(id, true)
    ├─→ axios.get('/credentials/:id/certificate/download?inline=true')
    │
    ├─→ Request Interceptor:
    │   └─→ Add Authorization: Bearer <JWT>
    │
    └─→ HTTP GET Request ──────────────────→ /credentials/:id/certificate/download
                                              ↓
                                          protect middleware
                                          ├─→ Check token
                                          ├─→ Verify signature
                                          └─→ ✅ Valid: Continue
                                              ↓
                                          credentialsController
                                          ├─→ Find credential
                                          ├─→ Check certificate exists
                                          └─→ Read PDF file
                                              ↓
                                          Response: PDF (blob)
    
Response received ←──────────────────────────
    ↓
Frontend processing:
├─→ response.data = PDF bytes
├─→ new Blob([PDF bytes])
├─→ window.URL.createObjectURL(blob)
├─→ window.open(blobUrl, "_blank")
└─→ Browser opens new tab with PDF
    ↓
User sees: ✅ PDF displayed
```

## Code Flow: View Certificate

```typescript
// Step 1: User clicks button
onClick={handleViewCertificate}

// Step 2: Async function called
const handleViewCertificate = async () => {
  try {
    // Step 3: Axios client makes authenticated request
    const response = await credentialsApi.downloadCertificate(credential.id, true);
    //         ↓
    //  axios.get(`/credentials/${id}/certificate/download?inline=true`, {
    //    responseType: "blob"  ← Important: binary data
    //  })
    //         ↓
    //  Interceptor adds: Authorization: Bearer <JWT>
    //         ↓
    //  Backend receives request with auth header
    //         ↓
    //  Backend validates token: ✅ Valid
    //         ↓
    //  Backend returns: PDF file as blob

    // Step 4: Create blob from response
    const blob = new Blob([response.data], { type: "application/pdf" });
    
    // Step 5: Create temporary URL
    const blobUrl = window.URL.createObjectURL(blob);
    // blobUrl = "blob:http://localhost:5173/a1b2c3d4-e5f6..."
    
    // Step 6: Open in new tab
    window.open(blobUrl, "_blank");
    
    // Step 7: Cleanup after opening
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    
  } catch (error) {
    // Step 8: Error handling
    console.error("Error viewing certificate:", error);
    alert("Failed to load certificate. Please try again.");
  }
};
```

## Axios Request Interceptor (Automatic)

```typescript
// In frontend/src/services/api/axios.ts

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();  // Get JWT from memory
    if (token) {
      // ✅ Add Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
```

## Backend Route Handler (Protected)

```typescript
// In backend/src/routes/credentials.routes.ts

// All routes use protect middleware
router.use(protect);  // ← Enforces authentication

// Certificate download endpoint
router.get("/:id/certificate/download", credentialsController.downloadCertificate);

// In middleware:
// 1. Check Authorization header
// 2. Extract token
// 3. Verify JWT signature
// 4. Check token expiration
// 5. Attach admin to request
// 6. If valid: Continue to handler
// 7. If invalid: Return 401 Unauthorized
```

## Download vs View: Difference

```
DOWNLOAD                         VIEW
════════════════════════════════════════════════════════════════

inline=false                     inline=true

Backend tells browser:           Backend tells browser:
"Content-Disposition:            "Content-Disposition:
 attachment"                      inline"

Browser response:                Browser response:
"Download file"                  "Display in page"

Frontend creates:                Frontend creates:
<a> link element                 Blob URL only

Action:                          Action:
Click link → Save to disk        window.open() → New tab

Result:                          Result:
File in ~/Downloads              PDF in new browser tab
Filename: CRED-123456.pdf        No download prompt
```

## Response Type: "blob"

Why is `responseType: "blob"` important?

```typescript
// Without responseType: "blob"
❌ response.data = JSON string (can't use as PDF)
   "{"error": "PDF data..."}"
   response.data.slice() = cuts the string, breaks PDF

// With responseType: "blob"
✅ response.data = ArrayBuffer (raw binary)
   response.data = Uint8Array [0x25, 0x50, 0x44, 0x46...]
   response.data.slice() = proper binary slicing
   Works correctly with Blob constructor
```

## Error Scenarios

```
Scenario 1: Token Missing
═════════════════════════════════════════════════════════
1. User not logged in
2. Axios can't find token
3. Request sent WITHOUT Authorization header
4. Backend returns: 401 Unauthorized
5. axios interceptor catches 401
6. Tries to refresh token
7. Refresh fails (no valid refresh token)
8. Clears credentials
9. Frontend shows error: "Failed to load certificate"
10. User should login again

Scenario 2: Token Expired
═════════════════════════════════════════════════════════
1. User logged in but token expired
2. Axios adds expired token to request
3. Request sent WITH Authorization header (but expired)
4. Backend returns: 401 Unauthorized (token expired)
5. axios interceptor catches 401
6. Calls refresh endpoint with refresh token
7. Backend returns new accessToken
8. axios updates token and RETRIES original request
9. Second request succeeds with new token
10. User sees PDF without knowing token was refreshed

Scenario 3: Certificate Doesn't Exist
═════════════════════════════════════════════════════════
1. User logged in (auth OK)
2. Credential doesn't have generated certificate
3. Request sent WITH valid Authorization header
4. Backend finds credential but no certificate file
5. Backend returns: 404 Not Found
6. Frontend catches error
7. Frontend shows error: "Failed to load certificate"

Scenario 4: User Unauthorized
═════════════════════════════════════════════════════════
1. User logged in as different entity (not admin)
2. Tries to view credential certificate
3. Request sent WITH valid Authorization header
4. Backend validates token: User is not admin
5. Backend returns: 403 Forbidden (insufficient permissions)
6. Frontend catches error
7. Frontend shows error: "Failed to load certificate"
```

## Security: Blob URLs

```
Why Blob URLs are secure:
═══════════════════════════════════════════════════════════

Blob URL: blob:http://localhost:5173/a1b2c3d4-e5f6...

✅ Only valid in current browser context
✅ Cannot be accessed by external requests
✅ Cannot be used in server-side code
✅ Temporary (expires when revoked)
✅ Not stored in browser history
✅ Not cacheable
✅ Not shareable with other users
✅ Cannot be guessed or predicted

Example:
- User A views certificate → Blob URL created
- Another browser/user → CANNOT access that Blob URL
- Same browser, new tab → CANNOT access that Blob URL
- After revokeObjectURL() → Cannot access even in same tab

This prevents:
❌ URL being stored in browser history
❌ URL being shared accidentally
❌ Direct unauthorized access
❌ Caching of sensitive PDFs
```

## Complete Function Reference

```typescript
// API Call (with authentication)
credentialsApi.downloadCertificate(id: string, inline: boolean)
  └→ axios.get(`/credentials/${id}/certificate/download?inline=${inline}`, {
       responseType: "blob"
     })
  └→ (with Authorization header automatically added)

// Create Blob
new Blob([response.data], { type: "application/pdf" })
  └→ Wraps binary data in Blob object
  └→ Type hints for proper PDF handling

// Create Blob URL
window.URL.createObjectURL(blob)
  └→ Returns: "blob:http://localhost:5173/..."
  └→ Temporary URL valid only in current browser

// Open in Browser
window.open(blobUrl, "_blank")
  └→ Opens new tab with Blob URL
  └→ Browser handles PDF rendering

// Cleanup
window.URL.revokeObjectURL(blobUrl)
  └→ Invalidates Blob URL
  └→ Frees memory
  └→ After 1000ms delay (allows time for browser to open)
```

## Testing the Fix

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Start frontend
cd frontend && npm run dev

# 3. Login to admin dashboard
# Navigate to http://localhost:5173/admin/login

# 4. Create a credential and generate certificate
# Navigate to Credentials → Create → Generate Certificate

# 5. View the credential detail page
# Click "View Certificate" → Should open PDF in new tab
# Check browser console → Should see NO errors

# 6. Test download
# Click "Download Certificate" → PDF downloads to disk
# Check filename → Should be [CREDENTIAL_ID].pdf
# Check browser console → Should see NO errors

# 7. Verify authentication
# Open Network tab in DevTools
# Click "View Certificate"
# Find the GET /credentials/.../certificate/download request
# Check Headers → Should show:
#   Authorization: Bearer eyJhbGciOi...
#   ✅ JWT token is present

# 8. Success criteria
# ✅ View Certificate opens PDF in new tab
# ✅ Download Certificate downloads PDF to disk
# ✅ No 401 errors
# ✅ No "Token Missing" errors
# ✅ Authorization header present in network requests
# ✅ No console errors or warnings
```

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Authentication | ❌ None (direct URL) | ✅ JWT via Axios |
| Error Handling | ❌ None | ✅ Try/catch with user alert |
| Security | ❌ URL exposed | ✅ Blob URL temporary |
| User Experience | ❌ Blank page on error | ✅ Clear error message |
| Authorization | ❌ Bypass possible | ✅ Always enforced |
| Status | ❌ 401 Unauthorized | ✅ 200 OK with auth |
