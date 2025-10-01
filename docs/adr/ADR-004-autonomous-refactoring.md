# ADR-004: Autonomous Refactoring System

**Date**: 2024-10-01

**Status**: Accepted

## Context

Code quality degrades over time without active maintenance:

- Files grow beyond manageable size
- Complexity increases unchecked
- Duplicated code spreads
- Technical debt accumulates

Current state:

- Manual refactoring prompts in system prompt
- Basic file size detection (500 lines threshold)
- No automated quality tracking
- Reactive rather than proactive

Problems:

1. **Inconsistent Enforcement**: Developers must remember to refactor
2. **No Metrics**: No objective measure of code quality
3. **Late Detection**: Issues found after they're entrenched
4. **Manual Process**: Refactoring requires explicit user request

## Decision

Implement an **Autonomous Refactoring System** with intelligent quality monitoring:

```
src/refactoring/
├── code-metrics.ts              # Quality metrics analyzer
├── autonomous-refactoring.ts    # Refactoring engine
└── refactoring-rules.ts         # Customizable rules
```

**Components**:

### 1. Code Metrics Analyzer

Tracks quality metrics:

- Lines of code per file
- Cyclomatic complexity
- Number of dependencies
- Function length
- Code duplication

### 2. Refactoring Engine

Generates intelligent suggestions:

- Identifies refactoring opportunities
- Suggests specific improvements
- Creates AI prompts for refactoring
- Tracks refactoring history

### 3. Integration Points

- **During Chat**: Check files before committing
- **On File Write**: Analyze new/modified files
- **Periodic Scans**: Background quality monitoring
- **Pre-commit Hook**: Prevent quality degradation

## Architecture

```
┌─────────────────┐
│   File Write    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Code Metrics    │
│   Analyzer      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Refactoring    │
│    Engine       │
└────────┬────────┘
         ↓
┌─────────────────┐
│   Suggestion    │
│    to User      │
└─────────────────┘
```

## Consequences

### Positive

- **Proactive Quality**: Issues caught early
- **Consistent Standards**: Automated enforcement
- **Better Codebase**: Continuous improvement
- **Developer Guidance**: Learns best practices
- **Reduced Technical Debt**: Prevents accumulation

### Negative

- **Computational Overhead**: Metrics calculation takes time
- **False Positives**: Not all large files need refactoring
- **Interruptions**: Suggestions might distract developers

### Mitigation

- Cache metrics to reduce computation
- Configurable thresholds and rules
- Suggestions are non-blocking
- User can disable for specific files

## Implementation

### Metrics Configuration

```typescript
export interface MetricsConfig {
  maxFileLines: number; // Default: 300
  maxFunctionLines: number; // Default: 50
  maxComplexity: number; // Default: 10
  maxDependencies: number; // Default: 10
}
```

### Refactoring Strategies

```typescript
export type RefactoringStrategy = {
  enableAutomatedRefactoring: boolean; // Auto-refactor critical issues
  enableSuggestions: boolean; // Show suggestions to user
  aggressiveness: "conservative" | "balanced" | "aggressive";
};
```

### Integration Example

```typescript
// In proposal handler
const refactoringAction = enhanceProposalWithRefactoring(writeTags);

if (refactoringAction) {
  actions.push({
    id: "refactor-file",
    path: refactoringAction.targetFile,
    description: refactoringAction.description,
    prompt: refactoringAction.prompt,
  });
}
```

## Refactoring Rules

### 1. Large File Rule

**Trigger**: File > 300 lines
**Action**: Suggest splitting into modules
**Prompt**: Generated based on file analysis

### 2. Complex Function Rule

**Trigger**: Function > 50 lines or complexity > 10
**Action**: Suggest extracting helpers
**Prompt**: Identify extraction opportunities

### 3. High Coupling Rule

**Trigger**: File imports > 10 modules
**Action**: Suggest dependency reduction
**Prompt**: Identify unnecessary dependencies

### 4. Duplicate Code Rule

**Trigger**: Similar code blocks detected
**Action**: Suggest extraction to utility
**Prompt**: Extract common functionality

## Customization

Users can customize via settings:

```typescript
{
  "refactoring": {
    "enabled": true,
    "strategy": "balanced",
    "rules": {
      "maxFileLines": 300,
      "maxFunctionLines": 50,
      "checkOnWrite": true,
      "periodicScan": true
    },
    "excludePatterns": [
      "**/test/**",
      "**/*.test.ts"
    ]
  }
}
```

## Metrics Dashboard

Future enhancement: Visual quality dashboard

- Quality score per file/module
- Trends over time
- Hot spots requiring attention
- Technical debt estimate

## Alternatives Considered

### 1. Static Analysis Only (ESLint/TSLint)

**Pros**: Established tools, fast
**Cons**: Limited to syntax, no semantic analysis

**Rejected**: Need deeper analysis for refactoring

### 2. Manual Code Reviews

**Pros**: Human judgment, context-aware
**Cons**: Slow, inconsistent, doesn't scale

**Rejected**: Too slow for continuous improvement

### 3. Full AST Analysis

**Pros**: Perfect accuracy
**Cons**: Complex, slow, heavy dependencies

**Rejected**: Too heavy for real-time use

## Migration Strategy

### Phase 1: Monitoring

- Deploy metrics analyzer
- Collect baseline data
- No automated actions

### Phase 2: Suggestions

- Enable suggestion system
- Train on user responses
- Refine thresholds

### Phase 3: Automation

- Enable automatic refactoring for critical issues
- User can opt-in per file
- Gradual rollout

## Success Metrics

Track effectiveness:

1. **Code Quality**: Average file size over time
2. **Response Rate**: % of suggestions accepted
3. **False Positives**: % of incorrect suggestions
4. **User Satisfaction**: Feedback from developers

## Related Decisions

- [ADR-001: Centralized Type System](./ADR-001-centralized-types.md)
- Easier refactoring with centralized types

- [ADR-002: Service Layer Architecture](./ADR-002-service-layer.md)
- Services enable better modularity
