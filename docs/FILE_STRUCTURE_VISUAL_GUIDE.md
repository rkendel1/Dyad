# File Structure Reorganization - Visual Guide

## Before vs After Structure

### Before: Unorganized Dependencies
```
Dyad/
├── package.json (all dependencies mixed)
├── src/ (desktop app)
├── web-app/ (separate, not linked)
└── packages/@dyad-sh/ (not properly linked)
    ├── core/
    ├── react/
    ├── cli/
    └── sdk/
```

❌ Issues:
- No workspace configuration
- Packages not properly linked
- Dependencies not isolated
- Unclear module boundaries

### After: Organized with Workspaces
```
Dyad/ (Root Workspace)
│
├── package.json ✓ (workspace config, desktop deps)
├── package-lock.json ✓ (workspace lock file)
│
├── src/ ✓ (Desktop App - Electron)
│   └── All desktop-specific code
│
├── web-app/ ✓ (Web App - Next.js)
│   ├── package.json (web-specific deps)
│   └── Uses: dyad-sh-core, dyad-sh-react
│
└── packages/@dyad-sh/ ✓ (Shared Packages)
    ├── core/ (0 runtime deps)
    │   ├── Built types & clients
    │   └── Used by: desktop, web, cli, sdk
    │
    ├── react/ (depends on core)
    │   └── Used by: web app
    │
    ├── cli/ (depends on core)
    │   └── Standalone CLI tool
    │
    └── sdk/ (depends on core)
        └── High-level SDK
```

✅ Benefits:
- Workspace linking via symlinks
- Dependencies properly isolated
- Clear module boundaries
- Efficient development workflow

## Package Dependency Graph

```
                    ┌─────────────────┐
                    │   dyad-sh-core  │
                    │ (0 dependencies)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ dyad-sh-cli │  │ dyad-sh-sdk │  │dyad-sh-react│
    └─────────────┘  └─────────────┘  └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   web-app   │
                                        │  (Next.js)  │
                                        └─────────────┘

    ┌─────────────┐
    │ Desktop App │ (uses dyad-sh-core)
    │ (Electron)  │
    └─────────────┘
```

## Workspace Linking

### Symlink Structure
```
node_modules/
├── dyad-sh-core → ../packages/@dyad-sh/core ✓
├── dyad-sh-react → ../packages/@dyad-sh/react ✓
├── dyad-sh-cli → ../packages/@dyad-sh/cli ✓
└── @dyad-sh/
    └── sdk → ../../packages/@dyad-sh/sdk ✓
```

### Package Resolution
When web-app imports `dyad-sh-core`, it resolves to:
```
web-app import:
  import { createHttpClient } from "dyad-sh-core"
                                      ↓
  Resolves to: /packages/@dyad-sh/core/dist/index.js
```

## Dependency Isolation

### Core Package (dyad-sh-core)
```json
{
  "dependencies": {} // ← Zero runtime deps!
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

### Desktop App (root)
```json
{
  "dependencies": {
    "electron": "...",
    "@ai-sdk/*": "...",
    "express": "...",
    "better-sqlite3": "...",
    // ... all desktop-specific deps
    "dyad-sh-core": "0.1.0" // ← workspace link
  }
}
```

### Web App (web-app/)
```json
{
  "dependencies": {
    "next": "...",
    "react": "...",
    // ... all web-specific deps
    "dyad-sh-core": "0.1.0", // ← workspace link
    "dyad-sh-react": "0.1.0" // ← workspace link
  }
}
```

## Build Process Flow

### Step 1: Install Dependencies
```bash
npm install
```
- Installs all workspace dependencies
- Creates symlinks for local packages
- Deduplicates shared dependencies

### Step 2: Build Packages (in order)
```bash
# 1. Core (no deps)
cd packages/@dyad-sh/core
npm run build
✓ dist/index.js created

# 2. Dependent packages
cd packages/@dyad-sh/react
npm run build
✓ Uses core via symlink

cd packages/@dyad-sh/cli
npm run build
✓ Uses core via symlink

cd packages/@dyad-sh/sdk
npm run build
✓ Uses core via symlink
```

### Step 3: Build Applications
```bash
# Web App
cd web-app
npm run build
✓ Uses dyad-sh-core and dyad-sh-react via workspace

# Desktop App
npm run package
✓ Uses dyad-sh-core via workspace
```

## Development Workflow

### Making Changes to Core

1. **Edit core package**
   ```bash
   cd packages/@dyad-sh/core
   # Edit src/types/index.ts
   ```

2. **Rebuild core**
   ```bash
   npm run build
   ```

3. **Changes immediately available**
   - Desktop app: ✓ (via symlink)
   - Web app: ✓ (via symlink)
   - CLI: ✓ (via symlink)
   - SDK: ✓ (via symlink)

4. **Test in applications**
   ```bash
   # Desktop
   npm start
   
   # Web
   cd web-app
   npm run dev
   ```

No need to publish or reinstall!

## Testing Verification

### Core Package Tests
```bash
cd packages/@dyad-sh/core
npm test
```
```
✓ cache.factory.test.ts (10 tests)
✓ localStorage.cache.test.ts (12 tests)
✓ indexedDB.cache.test.ts (12 tests)
──────────────────────────────
34 tests passed
```

### Web App Build
```bash
cd web-app
npm run build
```
```
✓ Compiled successfully
✓ Generated static pages (5/5)
✓ Build complete
```

### Desktop App TypeScript
```bash
npm run ts:main
```
Pre-existing TypeScript errors (not related to reorganization)

## Key Files Changed

1. **package.json** (root)
   - Added `workspaces` configuration
   
2. **packages/@dyad-sh/core/tsconfig.json**
   - Excluded test files from build
   
3. **web-app/src/components/ui/**
   - Added missing input.tsx and label.tsx components
   
4. **Documentation**
   - PROJECT_STRUCTURE.md
   - FILE_STRUCTURE_REORGANIZATION_SUMMARY.md
   - VISUAL_GUIDE.md (this file)

## Success Criteria ✓

- [x] Core package has zero runtime dependencies
- [x] Desktop app is self-contained with its dependencies
- [x] Web app is self-contained with its dependencies
- [x] All packages properly linked via workspaces
- [x] All packages build successfully
- [x] Tests pass
- [x] Structure promotes modularity
- [x] Clear separation of concerns
- [x] Comprehensive documentation

## Next Steps

Future enhancements could include:
- Publishing packages to npm registry
- Setting up automated testing in CI/CD
- Adding package versioning strategy
- Creating release automation
- Adding changesets for version management
