# Export Pattern Quick Reference

## Project Convention
All API services use **default exports** only.

## Correct Pattern

```typescript
// frontend/src/services/api/[service].api.ts

import { axiosInstance } from "./axios.js";

// Step 1: Export types and interfaces (optional but recommended)
export interface MyData { ... }
export type MyStatus = "ACTIVE" | "INACTIVE";

// Step 2: Define the API object
const myServiceApi = {
  method1: () => { ... },
  method2: () => { ... },
};

// Step 3: Export as default (REQUIRED)
export default myServiceApi;
```

## Import Usage

```typescript
// Single import (standard)
import myServiceApi from "../services/api/my-service.api";

// Import with types
import myServiceApi, { MyData } from "../services/api/my-service.api";

// Usage
const { data } = await myServiceApi.method1();
```

## Files Following This Pattern ✅

All API files in the project follow this pattern:

| API Service | File | Default Export |
|---|---|---|
| advisors | `advisors.api.ts` | ✅ advisorsApi |
| applications | `applications.api.ts` | ✅ applicationsApi |
| audit | `audit.api.ts` | ✅ auditApi |
| auditors | `auditors.api.ts` | ✅ auditorsApi |
| auth | `auth.api.ts` | ✅ authApi |
| content | `content.api.ts` | ✅ contentApi |
| credentials | `credentials.api.ts` | ✅ credentialsApi |
| dashboard | `dashboard.api.ts` | ✅ dashboardApi |
| organizations | `organizations.api.ts` | ✅ organizationsApi |
| public-applications | `public-applications.api.ts` | ✅ publicApplicationsApi |
| settings | `settings.api.ts` | ✅ settingsApi |
| training-institutes | `training-institutes.api.ts` | ✅ trainingInstitutesApi |

## Common Issues & Fixes

### Issue 1: Missing Default Export
```typescript
// ❌ WRONG - No default export
const myApi = { ... };

// ✅ RIGHT - Add default export
const myApi = { ... };
export default myApi;
```

### Issue 2: Wrong Export Style
```typescript
// ❌ WRONG - Named export only
export const myApi = { ... };

// ✅ RIGHT - Use default export (project convention)
export const myApi = { ... };
export default myApi;
```

### Issue 3: Import Mismatch
```typescript
// ❌ WRONG - Named import for default export
import { myApi } from "../services/api/my.api";

// ✅ RIGHT - Default import
import myApi from "../services/api/my.api";
```

## Recently Fixed Files

### credentials.api.ts
**Issue:** Missing default export
```typescript
// ❌ Before
const credentialsApi = { ... };
// No export!

// ✅ After
const credentialsApi = { ... };
export default credentialsApi;
```

## Verification Command

To verify all API files have proper exports:
```bash
grep -r "export default" frontend/src/services/api/
```

Expected output: 12 API files with `export default [name]Api;`

## For New API Services

When creating a new API service:

1. Create file: `frontend/src/services/api/new-service.api.ts`
2. Define the API object: `const newServiceApi = { ... }`
3. Export as default: `export default newServiceApi;`
4. Import in components: `import newServiceApi from "../services/api/new-service.api";`

## No Exceptions

This pattern applies to **ALL** API services in the project.

Do NOT use:
- ❌ Named exports only
- ❌ Mixing named and default exports
- ❌ Different patterns per file
- ❌ Re-exports
- ❌ Dynamic imports for API objects

Consistency ensures:
- ✅ Easy refactoring
- ✅ Consistent imports across codebase
- ✅ No import resolution errors
- ✅ Better tree-shaking
- ✅ Clearer code maintenance
