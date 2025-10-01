# Migration Guide: Type System Refactoring

## Overview

This guide helps developers migrate their code to use the new centralized type system.

## Quick Reference

### Before (Old)

```typescript
import type { App, Chat, Message } from "../ipc/ipc_types";
```

### After (New)

```typescript
import type { App, Chat, Message } from "@/types";
```

## Breaking Changes

### None! 🎉

This refactoring is **100% backward compatible**. All existing imports will continue to work because:

1. `src/ipc/ipc_types.ts` now re-exports everything from `src/types/`
2. All type definitions remain identical
3. No runtime behavior changes

## Recommended Changes (Optional)

While not required, we recommend updating imports to use the new centralized location:

### 1. Update Import Statements

**Find and replace across your codebase:**

```bash
# Find files using old imports
grep -r "from.*ipc_types" --include="*.ts" --include="*.tsx" src/

# Replace with new imports
# Old: import type { App } from '../ipc/ipc_types';
# New: import type { App } from '@/types';
```

### 2. Examples by File Location

#### In `src/components/`

```typescript
// Before
import type { App, Chat } from "../../ipc/ipc_types";

// After
import type { App, Chat } from "@/types";
```

#### In `src/hooks/`

```typescript
// Before
import type { Message } from "../ipc/ipc_types";

// After
import type { Message } from "@/types";
```

#### In `src/ipc/handlers/`

```typescript
// Before
import type { App, CreateAppParams } from "../ipc_types";

// After
import type { App, CreateAppParams } from "@/types";
```

### 3. Benefits of Updating

1. **Shorter imports**: `@/types` vs `../../ipc/ipc_types`
2. **Clearer intent**: Shows you're using the centralized system
3. **Future-proof**: `ipc_types.ts` may be removed in a future major version
4. **Better IDE support**: Autocomplete works better with `@/types`

## Database Schema Changes

### New Fields Added

The `apps` table now has two new optional fields:

```sql
ALTER TABLE `apps` ADD `supabase_project_name` text;
ALTER TABLE `apps` ADD `vercel_team_slug` text;
```

### What This Means

- **For existing databases**: Migration will run automatically on next app start
- **For new databases**: Fields are included in the schema
- **For existing code**: No changes required - fields are nullable

### If You Query the Database Directly

Update your types to include the new fields:

```typescript
// Before
type AppFromDB = {
  id: number;
  supabaseProjectId: string | null;
  vercelTeamId: string | null;
  // ...
};

// After
type AppFromDB = {
  id: number;
  supabaseProjectId: string | null;
  supabaseProjectName: string | null; // NEW
  vercelTeamId: string | null;
  vercelTeamSlug: string | null; // NEW
  // ...
};
```

## Type Changes

### Changed Types (Minor)

A few types were updated to match the actual implementation:

#### LanguageModel

```typescript
// Before
export interface LanguageModel {
  apiName: string;
  displayName: string;
  type: "custom" | "local" | "cloud";
}

// After (union type)
export type LanguageModel =
  | {
      id: number; // Added for custom models
      apiName: string;
      displayName: string;
      type: "custom";
    }
  | {
      apiName: string;
      displayName: string;
      type: "local" | "cloud";
    };
```

**Impact**: If you were creating LanguageModel objects, ensure custom models include `id`.

#### CreateCustomLanguageModelProviderParams

```typescript
// Before
export interface CreateCustomLanguageModelProviderParams {
  name: string;
  apiBaseUrl: string;
  envVarName?: string;
}

// After
export interface CreateCustomLanguageModelProviderParams {
  id: string; // Added
  name: string;
  apiBaseUrl: string;
  envVarName?: string;
}
```

**Impact**: Provide an `id` when creating custom providers.

#### CopyAppParams

```typescript
// Before
export interface CopyAppParams {
  appId: number;
  newName: string;
}

// After
export interface CopyAppParams {
  appId: number;
  newAppName: string; // Renamed
  withHistory: boolean; // Added
}
```

**Impact**: Update field name and provide `withHistory` flag.

## Behavior Changes

### External API Data Caching

The `get-app` handler now caches external API data:

#### What Changed

- First call to `get-app`: Fetches from external API and caches in database
- Subsequent calls: Returns cached value from database
- When integration ID changes: Cache is cleared and will be re-fetched

#### What This Means for You

**Benefits:**

- Faster response times (no external API call)
- Works offline once cached
- Reduces risk of hitting rate limits

**Potential Issues:**

- Cached names may be slightly out of date
- If you need fresh data, you'll need to manually clear cache (future enhancement)

#### How to Force Refresh (if needed)

Currently, to force a refresh:

1. Disconnect and reconnect the integration, OR
2. Manually set the cached field to `null` in database

Future enhancement will add a "refresh" button in the UI.

## Testing Your Changes

### 1. Type Checking

Run TypeScript compiler to verify no type errors:

```bash
npm run ts:main
npm run ts:workers
```

### 2. Linting

Run linter to check for issues:

```bash
npm run lint
```

### 3. Unit Tests

Run unit tests to verify behavior:

```bash
npm test
```

### 4. Integration Tests

Test the app manually:

1. Create a new app
2. Connect to Vercel/Supabase
3. Verify project names display correctly
4. Restart app and verify cached data is used

## Common Issues

### Issue: TypeScript can't find `@/types`

**Solution**: Ensure `tsconfig.json` has the path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Import errors after migration

**Solution**:

1. Clear TypeScript cache: `rm -rf node_modules/.cache`
2. Restart IDE/editor
3. Rebuild: `npm run ts:main`

### Issue: Cached data is stale

**Solution**: Currently, you can:

1. Disconnect and reconnect the integration
2. Or wait for future enhancement to add manual refresh

## Gradual Migration Strategy

You don't need to migrate everything at once. We recommend:

### Phase 1: New Code

- All new code uses `@/types` imports
- Add to code review checklist

### Phase 2: Modified Files

- When editing a file, update imports to `@/types`
- No separate migration PR needed

### Phase 3: Bulk Migration (Optional)

- Run automated find/replace across codebase
- Create separate PR for review
- Only do this if you want to clean up completely

## Need Help?

If you encounter issues during migration:

1. Check [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) for architecture details
2. Review [CODING_STANDARDS.md](./guidelines/CODING_STANDARDS.md) for best practices
3. Look at recent commits for examples
4. Ask in team chat or create an issue

## Rollback Plan

If you need to rollback (shouldn't be necessary):

The refactoring is backward compatible, so there's no rollback needed. However, if you want to revert to the previous state:

```bash
# Find the commit before the refactoring
git log --oneline | grep "Initial plan"

# Revert to that commit (replace COMMIT_HASH)
git revert COMMIT_HASH..HEAD
```

Note: This is not recommended as the new system is more maintainable.
