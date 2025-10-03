# Project Structure and Dependency Management

This document describes the reorganized file structure of the Dyad project and how dependencies are managed across modules.

## Overview

The project is organized as an npm workspace with the following structure:

```
Dyad/
├── packages/@dyad-sh/          # Shared packages
│   ├── core/                   # Core types and client implementations
│   ├── react/                  # React hooks for Dyad
│   ├── cli/                    # Command-line interface
│   └── sdk/                    # High-level SDK
├── web-app/                    # Next.js web application
└── src/                        # Desktop application (Electron)
```

## Workspace Configuration

The project uses npm workspaces to manage dependencies and ensure proper package linking. This is configured in the root `package.json`:

```json
{
  "workspaces": [
    "packages/@dyad-sh/*",
    "web-app"
  ]
}
```

## Package Dependencies

### Core Package (`@dyad-sh/core`)

**Purpose**: Shared types, interfaces, and client implementations

**Dependencies**: Zero runtime dependencies (pure TypeScript)

**Exports**:
- Type definitions (App, Chat, Message, etc.)
- Client interfaces (DyadClient, AppApi, ChatApi, etc.)
- HTTP and IPC client implementations
- Cache implementations (Memory, LocalStorage, IndexedDB)
- Factory functions for client creation

**Location**: `packages/@dyad-sh/core`

### React Package (`@dyad-sh/react`)

**Purpose**: React hooks for Dyad client integration

**Dependencies**:
- `dyad-sh-core` (peer dependency, linked via workspace)
- `react` (peer dependency)

**Location**: `packages/@dyad-sh/react`

### CLI Package (`@dyad-sh/cli`)

**Purpose**: Command-line interface for Dyad

**Dependencies**:
- `dyad-sh-core` (linked via workspace)

**Location**: `packages/@dyad-sh/cli`

### SDK Package (`@dyad-sh/sdk`)

**Purpose**: High-level SDK for simplified integration

**Dependencies**:
- `dyad-sh-core` (linked via workspace)

**Location**: `packages/@dyad-sh/sdk`

### Desktop Application

**Purpose**: Electron-based desktop application

**Dependencies**: All desktop-specific dependencies including:
- Electron and related packages
- AI SDK providers (@ai-sdk/*)
- Database (better-sqlite3, drizzle-orm)
- UI components (@radix-ui/*, react, etc.)
- Express server and middleware
- And all other desktop-specific runtime dependencies

**Location**: Root directory (`/`)

### Web Application

**Purpose**: Next.js web application

**Dependencies**: All web-specific dependencies including:
- Next.js and React
- Dyad packages (dyad-sh-core, dyad-sh-react)
- UI components
- Web-specific utilities

**Location**: `web-app/`

## Dependency Isolation

### Core Package Isolation

The core package (`@dyad-sh/core`) maintains **zero runtime dependencies** to ensure:
- Maximum compatibility across environments
- Minimal bundle size
- No version conflicts
- Pure TypeScript implementation

### Desktop App Isolation

The desktop application includes:
- **All Electron-specific dependencies**
- **All AI provider SDKs** (@ai-sdk/*)
- **Desktop UI libraries** (React, Radix UI, etc.)
- **Backend services** (Express, SQLite, etc.)

These dependencies are **NOT** shared with the web app to ensure clean separation.

### Web App Isolation

The web application includes:
- **Next.js framework dependencies**
- **Web-specific UI libraries**
- **Dyad core packages** (via workspace linking)

The web app is **self-contained** and can be deployed independently.

## Building Packages

### Build Order

1. **Core package first** (no dependencies):
   ```bash
   cd packages/@dyad-sh/core
   npm run build
   ```

2. **Dependent packages** (react, cli, sdk):
   ```bash
   cd packages/@dyad-sh/react
   npm run build
   
   cd packages/@dyad-sh/cli
   npm run build
   
   cd packages/@dyad-sh/sdk
   npm run build
   ```

3. **Applications** (desktop, web):
   ```bash
   # Desktop
   npm run package
   
   # Web
   cd web-app
   npm run build
   ```

### Workspace Installation

Install all dependencies and link packages:

```bash
npm install
```

This will:
- Install all root dependencies
- Install all workspace package dependencies
- Create symlinks for local packages
- Build necessary packages

## Package Linking

Workspace packages are linked automatically by npm. This means:

- The desktop app can import from `dyad-sh-core` without publishing
- The web app can import from `dyad-sh-core` and `dyad-sh-react` via workspace links
- Changes to core packages are immediately available to consumers (after rebuild)

Example symlinks created:
```
node_modules/dyad-sh-core -> ../packages/@dyad-sh/core
node_modules/dyad-sh-react -> ../packages/@dyad-sh/react
node_modules/dyad-sh-cli -> ../packages/@dyad-sh/cli
```

## Development Workflow

1. **Make changes to core package**:
   ```bash
   cd packages/@dyad-sh/core
   # Edit files
   npm run build
   ```

2. **Changes are immediately available** to desktop and web apps (via symlinks)

3. **Rebuild dependent packages** if needed:
   ```bash
   cd packages/@dyad-sh/react
   npm run build
   ```

4. **Test in applications**:
   ```bash
   # Desktop
   npm start
   
   # Web
   cd web-app
   npm run dev
   ```

## Benefits of This Structure

1. **Modularity**: Each package has a clear, single responsibility
2. **Reusability**: Core package can be used in desktop, web, and CLI
3. **Independence**: Web and desktop apps are self-contained
4. **Type Safety**: Shared TypeScript types ensure consistency
5. **Easy Development**: Workspace linking enables rapid iteration
6. **Clean Dependencies**: No unnecessary dependencies in any module

## Migration Notes

- The core package (`@dyad-sh/core`) was extracted to promote code reuse
- Both desktop and web applications now use the same core types and clients
- Dependencies have been properly isolated to their respective applications
- The workspace configuration ensures all packages are properly linked during development
