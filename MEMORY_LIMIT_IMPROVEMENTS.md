# Node.js Memory Limit and npm Global CLI Improvements

## Overview

This update increases the Node.js/Electron memory limit and improves npm global CLI support for better application performance and compatibility.

## Changes Made

### 1. Increased Node.js Memory Limit (4096MB)

The default Node.js memory limit has been increased from ~1.4GB to 4096MB (4GB) by setting the `NODE_OPTIONS` environment variable with `--max-old-space-size=4096`.

#### Where Applied:

- **Main Electron Process** (`src/main.ts`): Applied at the very start before any imports to ensure it takes effect
- **Spawned App Processes** (`src/ipc/handlers/app_handlers.ts`): Applied to child processes running user applications
- **Docker Containers** (`src/ipc/handlers/app_handlers.ts`): Applied as environment variable in Docker containers
- **E2E Test Environment** (`e2e-tests/helpers/test_helper.ts`): Applied during end-to-end testing

#### Benefits:

- Prevents out-of-memory errors when building or running large applications
- Improves performance for memory-intensive operations like TypeScript compilation, bundling, and hot module reloading
- Better handles large codebases and complex dependency trees

### 2. Improved npm Global CLI Support

Enhanced the pnpm installation fallback chain to be more reliable across different Node.js installation methods and environments.

#### Installation Attempt Order:

1. **Check existing pnpm**: Use if already installed
2. **Corepack** (preferred): `corepack enable pnpm` - Modern Node.js built-in package manager manager
3. **npx with auto-install**: `npx -y pnpm@latest-10` - Use pnpm without global installation
4. **npm global install**: `npm install -g pnpm@latest-10` - Traditional global installation
5. **npx without auto-install**: `npx pnpm@latest-10` - Final fallback
6. **Graceful degradation**: Returns "Not available" with proper error logging if all methods fail

#### Benefits:

- Works in environments where global npm installs are restricted (e.g., nvm, containerized environments)
- Uses modern package manager managers (corepack) when available
- Falls back gracefully through multiple methods
- Better error handling and logging for debugging

## Testing

New test files were added to verify the changes:

- `src/__tests__/node_options.test.ts`: Tests NODE_OPTIONS configuration logic
- `src/__tests__/node_handlers.test.ts`: Tests pnpm installation fallback logic

Run tests with:

```bash
npm test -- node_options.test.ts
npm test -- node_handlers.test.ts
```

## Compatibility

These changes are backward compatible and will not affect existing functionality:

- If `NODE_OPTIONS` is already set with `--max-old-space-size`, it won't be overridden
- Existing NODE_OPTIONS values are preserved and new options are appended
- The pnpm installation fallback gracefully handles all scenarios

## Performance Impact

Expected improvements:

- Reduced out-of-memory crashes during large builds
- Faster compilation and bundling times for memory-intensive operations
- Better handling of large dependency installations
