# Quick Reference: Production-Ready Infrastructure

## 🚀 Quick Start

### For Developers Using the New Infrastructure

```bash
# Check code quality
npm run quality:analyze

# Generate API docs
npm run openapi:generate

# Full quality check before commit
npm run prettier && npm run lint && npm test
```

## 📦 What Was Added

### 1. Centralized Types (`src/types/`)

```typescript
// Instead of:
import type { App } from "../ipc/ipc_types";

// Use:
import type { App } from "../../types";
```

### 2. Service Layer (`src/api/services/`)

```typescript
// New: Business logic in services
export class AppService {
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // Business logic here
  }
}

// Handlers delegate to services
ipcMain.handle("create-app", async (event, params) => {
  return await appService.createApp(params);
});
```

### 3. OpenAPI Documentation

```bash
# Generate openapi.json
npm run openapi:generate
```

### 4. Code Quality Monitoring

```bash
# Analyze codebase
npm run quality:analyze

# Get detailed report
npm run quality:report
```

## 📚 Key Documentation

| Document                                  | Purpose                |
| ----------------------------------------- | ---------------------- |
| `docs/PRODUCTION_READY_INFRASTRUCTURE.md` | Complete usage guide   |
| `docs/guidelines/CODING_STANDARDS.md`     | Coding standards       |
| `docs/architecture/ARCHITECTURE.md`       | System architecture    |
| `docs/adr/`                               | Architecture decisions |
| `PRODUCTION_ENHANCEMENTS.md`              | Implementation summary |

## 🎯 Common Tasks

### Adding a New Type

1. Choose appropriate file in `src/types/`
2. Define the type
3. Export from `index.ts`

```typescript
// In src/types/feature.types.ts
export interface NewFeature {
  id: number;
  name: string;
}

// In src/types/index.ts
export * from "./feature.types";
```

### Creating a Service

1. Create file in `src/api/services/`
2. Implement service class
3. Export singleton instance

```typescript
// src/api/services/feature.service.ts
export class FeatureService {
  async doSomething(params: Params): Promise<Result> {
    // Implementation
  }
}

export const featureService = new FeatureService();
```

### Using in Handler

```typescript
import { featureService } from "../../api/services/feature.service";

handle("feature-action", async (event, params) => {
  return await featureService.doSomething(params);
});
```

## 🔍 Code Review Checklist

- [ ] Types defined in `src/types/`
- [ ] Business logic in service layer
- [ ] Files under 300 lines
- [ ] Proper error handling
- [ ] JSDoc for public APIs
- [ ] Tests included
- [ ] No console.log (use logger)
- [ ] No hardcoded strings

## 🛠️ Refactoring

### When to Refactor

- File > 300 lines
- Function > 50 lines
- Duplicate code
- High complexity

### How

The system will automatically suggest refactoring:

```
⚠️  File src/example.ts has 450 lines
    Suggestion: Split into smaller modules
```

## 📊 Quality Metrics

Current thresholds:

- **Max file lines**: 300
- **Max function lines**: 50
- **Max complexity**: 10
- **Max dependencies**: 10

## 🔗 Quick Links

- [Full Documentation](./docs/PRODUCTION_READY_INFRASTRUCTURE.md)
- [Coding Standards](./docs/guidelines/CODING_STANDARDS.md)
- [Architecture](./docs/architecture/ARCHITECTURE.md)

## 🆘 Need Help?

1. Check documentation above
2. Review ADRs in `docs/adr/`
3. Ask team or open issue

---

**Last Updated**: 2024-10-01
