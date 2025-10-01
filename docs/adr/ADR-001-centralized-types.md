# ADR-001: Centralized Type System

**Date**: 2024-10-01

**Status**: Accepted

## Context

Previously, type definitions were scattered across the codebase:

- `src/ipc/ipc_types.ts` contained most IPC-related types
- `src/components/chat/types.d.ts` had UI-specific types
- `vscode-extension/src/dyadApi.ts` duplicated many types
- Type imports came from various locations, making refactoring difficult

Problems:

1. **Type Duplication**: Same types defined in multiple places
2. **Inconsistency**: Similar types had different names/structures
3. **Difficult Refactoring**: Changing a type required updating multiple files
4. **Poor Organization**: Hard to find the right type to use
5. **Circular Dependencies**: Cross-module type dependencies created import cycles

## Decision

Centralize all type definitions in a dedicated `src/types/` directory, organized by domain:

```
src/types/
├── index.ts              # Central export point
├── app.types.ts          # Application domain types
├── chat.types.ts         # Chat and messaging types
├── user.types.ts         # User and settings types
├── integration.types.ts  # Third-party integration types
├── api.types.ts          # API request/response types
└── shared.types.ts       # Common utility types
```

**Rules**:

1. All types must be exported from `src/types/index.ts`
2. Import types using: `import type { Type } from '@/types'`
3. No type definitions in non-type files (except local interfaces)
4. One domain per file, organized logically
5. Use TypeScript `type` for aliases, `interface` for object shapes

## Consequences

### Positive

- **Single Source of Truth**: One place to find/update types
- **Better Organization**: Domain-based organization is intuitive
- **Easier Refactoring**: Change propagates automatically
- **Prevents Duplication**: Clear where types should be defined
- **Better IDE Support**: Autocomplete finds types easily
- **Breaking Circular Dependencies**: Types are a leaf dependency

### Negative

- **Migration Effort**: Need to move existing types
- **Learning Curve**: Team needs to learn new import patterns
- **Larger Import Statements**: More types from single location

### Mitigation

- Gradual migration: Existing code can continue using old imports
- Update imports during normal refactoring
- Use path aliases (`@/types`) for cleaner imports

## Alternatives Considered

### 1. Keep Types Co-located with Implementation

**Pros**: Types close to where they're used
**Cons**: Hard to share types, leads to duplication

**Rejected**: Doesn't solve the duplication problem

### 2. Single Types File

**Pros**: Simple, everything in one place
**Cons**: File becomes massive, hard to navigate

**Rejected**: Doesn't scale as project grows

### 3. Types by Layer (ui-types, db-types, etc.)

**Pros**: Organized by technical layer
**Cons**: Domain concepts split across files

**Rejected**: Domain organization is more intuitive

## Implementation Notes

1. Create `src/types/` directory structure
2. Migrate types from `ipc_types.ts` to domain files
3. Add barrel export in `index.ts`
4. Update tsconfig paths for `@/types` alias
5. Gradually update imports across codebase

## Related Decisions

- [ADR-002: Service Layer Architecture](./ADR-002-service-layer.md)
- Uses centralized types for service contracts
