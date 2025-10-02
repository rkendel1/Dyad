# Web App File Management - Visual Guide

This guide shows the visual appearance and structure of the implemented features.

## 1. Enhanced Proposal Display

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Proposed File Changes                    [Reject] [Accept]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📄 Files Changed (3)                                            │
│   ├─ 🟢 write   │ components/Button.tsx                         │
│   │             │ Create new button component                   │
│   │             │ src/components/Button.tsx                     │
│   │                                                              │
│   ├─ 🔴 delete  │ old-button.tsx                                │
│   │             │ Delete file                                   │
│   │             │ src/components/old-button.tsx                 │
│   │                                                              │
│   └─ 🔵 rename  │ utils.ts                                      │
│                 │ Rename from helpers.ts to utils.ts            │
│                 │ src/utils.ts                                  │
│                                                                  │
│ 📦 Packages Added (2)                                           │
│   ├─ [react-icons]                                              │
│   └─ [clsx]                                                     │
│                                                                  │
│ 🗄️  Database Changes (1)                                        │
│   └─ [Create users table]                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Color Coding

- 🟢 **Green badges**: Write operations (new or modified files)
- 🔴 **Red badges**: Delete operations (removed files)
- 🔵 **Blue badges**: Rename operations (renamed files)
- 🟣 **Purple badges**: Package additions
- 🔷 **Blue badges**: SQL/Database changes

### Button States

**Accept Button:**
- Default: Green background, white text
- Hover: Darker green
- Loading: Shows spinner + "Accepting..."
- Disabled: Grayed out when rejecting or already processing

**Reject Button:**
- Default: Outlined, red border
- Hover: Red background
- Loading: Shows spinner + "Rejecting..."
- Disabled: Grayed out when accepting or already processing

## 2. Message Display with Approval State

### User Message

```
┌──────────────────────────────────────────────────┐
│                      Add a login page            │ ← User
│                      2 minutes ago               │
└──────────────────────────────────────────────────┘
```

### Assistant Message (Before Approval)

```
┌────────────────────────────────────────────────────┐
│ 🤖 I'll create a login page for you...            │ ← Assistant
│    [Full markdown-rendered response]              │
│                                                    │
│    2 minutes ago                                  │
└────────────────────────────────────────────────────┘
```

### Assistant Message (After Approval)

```
┌────────────────────────────────────────────────────┐
│ 🤖 I'll create a login page for you...            │ ← Assistant
│    [Full markdown-rendered response]              │
│    ─────────────────────────────────────            │
│    ✅ Approved · 📝 a1b2c3d                       │ ← New!
│                                                    │
│    2 minutes ago                                  │
└────────────────────────────────────────────────────┘
```

### Assistant Message (After Rejection)

```
┌────────────────────────────────────────────────────┐
│ 🤖 I'll create a login page for you...            │ ← Assistant
│    [Full markdown-rendered response]              │
│    ─────────────────────────────────────────────    │
│    ❌ Rejected                                     │ ← New!
│                                                    │
│    2 minutes ago                                  │
└────────────────────────────────────────────────────┘
```

### Approval State Visual Elements

- **✅ Green checkmark**: Approved proposals
- **❌ Red X**: Rejected proposals
- **📝 Git icon + hash**: Commit reference (only for approved)
- **Divider line**: Separates approval info from message content
- **Muted colors**: Subtle but visible approval indicators

## 3. Retry Button

### Location and Appearance

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [All messages displayed above]                   │
│                                                    │
│  ─────────────────────────────────────────────    │
│                                                    │
│         ┌──────────────────────────────┐          │
│         │  🔄  Retry Last Message      │          │ ← Retry Button
│         └──────────────────────────────┘          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Button States

**Default:**
- Icon: 🔄 RotateCcw
- Text: "Retry Last Message"
- Style: Outlined button, centered

**Loading:**
- Icon: ⏳ Spinner (animated)
- Text: "Retrying..."
- Style: Disabled, shows loading state

**Hidden When:**
- No messages exist in chat
- AI is currently typing
- No user messages found

## 4. Component Structure

### Proposal Display Component

```typescript
<ProposalDisplay>
  <Alert> (Orange-themed for attention)
    <AlertTitle>
      <span>{title}</span>
      <div>
        <RejectButton />
        <AcceptButton />
      </div>
    </AlertTitle>
    <AlertDescription>
      {filesChanged.map(file => (
        <FileChangeItem
          icon={getFileIcon(type)}
          color={getFileColor(type)}
          name={file.name}
          path={file.path}
          summary={file.summary}
          badge={file.type}
        />
      ))}
      {packagesAdded.map(...)}
      {sqlQueries.map(...)}
    </AlertDescription>
  </Alert>
</ProposalDisplay>
```

### Messages Display Component

```typescript
<MessagesDisplay>
  <CardContent>
    {messages.map(message => (
      <MessageBubble
        role={message.role}
        content={<MarkdownRenderer />}
        timestamp={formatDistanceToNow()}
        approvalState={message.approvalState}
        commitHash={message.commitHash}
      />
    ))}
    {isAssistantTyping && <TypingIndicator />}
    {canRetry && <RetryButton onClick={handleRetry} />}
  </CardContent>
</MessagesDisplay>
```

## 5. Responsive Design

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  Dyad - App Name                                     [X]    │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  Chat 1      │  ⚠️  Proposal Display (if exists)            │
│  Chat 2      │  ─────────────────────────────────────────   │
│  Chat 3      │  💬 User: Message                            │
│  [+ New]     │  🤖 AI: Response                             │
│              │     ✅ Approved · 📝 abc123d                 │
│              │  ─────────────────────────────────────────   │
│              │  💬 User: Another message                    │
│              │  🤖 AI: Response                             │
│              │  ─────────────────────────────────────────   │
│              │          [🔄 Retry Last Message]             │
│              │  ─────────────────────────────────────────   │
│              │  [Type your message...]          [Send]      │
└──────────────┴──────────────────────────────────────────────┘
  3 cols         9 cols (responsive grid)
```

### Mobile (< 768px)

```
┌─────────────────────────────────┐
│  ☰  Dyad - App Name        [X] │
├─────────────────────────────────┤
│                                 │
│  ⚠️  Proposal (stacked)         │
│     [Reject]  [Accept]         │
│  ─────────────────────────────  │
│  💬 User: Message               │
│  ─────────────────────────────  │
│  🤖 AI: Response                │
│     ✅ Approved · 📝 abc123d    │
│  ─────────────────────────────  │
│  [🔄 Retry Last Message]        │
│  ─────────────────────────────  │
│  [Type message...]    [Send]   │
└─────────────────────────────────┘
  Full width, stacked layout
```

## 6. Color Palette

### File Change Types

```css
/* Write (Create/Modify) */
--file-write-light: #22c55e;     /* Green 500 */
--file-write-dark: #4ade80;      /* Green 400 */
--file-write-bg-light: #dcfce7;  /* Green 100 */
--file-write-bg-dark: #14532d;   /* Green 900/30 */

/* Delete */
--file-delete-light: #ef4444;    /* Red 500 */
--file-delete-dark: #f87171;     /* Red 400 */
--file-delete-bg-light: #fee2e2; /* Red 100 */
--file-delete-bg-dark: #7f1d1d;  /* Red 900/30 */

/* Rename */
--file-rename-light: #3b82f6;    /* Blue 500 */
--file-rename-dark: #60a5fa;     /* Blue 400 */
--file-rename-bg-light: #dbeafe; /* Blue 100 */
--file-rename-bg-dark: #1e3a8a;  /* Blue 900/30 */

/* Package */
--package-light: #a855f7;        /* Purple 500 */
--package-dark: #c084fc;         /* Purple 400 */
--package-bg-light: #f3e8ff;     /* Purple 100 */
--package-bg-dark: #581c87;      /* Purple 900/30 */
```

### Approval States

```css
/* Approved */
--approved-color: #22c55e;       /* Green 600 */
--approved-icon: #4ade80;        /* Green 400 */

/* Rejected */
--rejected-color: #dc2626;       /* Red 600 */
--rejected-icon: #f87171;        /* Red 400 */

/* Proposal Alert */
--proposal-bg-light: #fffbeb;    /* Orange 50 */
--proposal-bg-dark: #7c2d12;     /* Orange 950/20 */
--proposal-border-light: #fed7aa;/* Orange 200 */
--proposal-border-dark: #7c2d12; /* Orange 800 */
```

## 7. Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close dialogs

### Screen Reader Support
- Semantic HTML elements
- ARIA labels on icons
- Descriptive button text
- Status announcements for loading states

### Visual Indicators
- Color is not the only indicator (icons + text)
- High contrast mode support
- Clear focus states
- Loading spinners with text

## 8. Loading States

### Accept Button Loading

```
┌──────────────────┐
│ ⏳ Accepting...  │  (Spinner + Text)
└──────────────────┘
```

### Retry Button Loading

```
┌───────────────────┐
│ ⏳ Retrying...    │  (Spinner + Text)
└───────────────────┘
```

### AI Typing Indicator

```
┌─────────────────────────────────┐
│ 🤖 AI is typing...  ⏳          │
└─────────────────────────────────┘
```

## 9. Error States

### API Error (Proposal)

```
┌────────────────────────────────────┐
│ ⚠️  Failed to load proposal        │
│    Please try again                │
└────────────────────────────────────┘
```

### Retry Failed

```
┌────────────────────────────────────┐
│ ❌ Failed to retry message         │
│    Please check your connection    │
└────────────────────────────────────┘
```

## 10. Animation & Transitions

### Smooth Transitions
- Button hover: 150ms ease-in-out
- Badge appearance: 200ms fade-in
- Loading spinner: continuous rotation
- Message scroll: smooth scrolling
- Approval state reveal: 300ms slide-in

### Micro-interactions
- Button press: slight scale down (0.98)
- Hover effects: subtle color shift
- Focus rings: 2px outline with offset
- Icon animations: bounce for AI typing

---

## Implementation Details

All visual components follow these principles:
1. **Consistent spacing**: 4px, 8px, 12px, 16px, 24px grid
2. **Typography**: System font stack with fallbacks
3. **Dark mode**: Full support with appropriate color adjustments
4. **Responsive**: Mobile-first with breakpoints at 640px, 768px, 1024px
5. **Performance**: CSS-only animations, no JavaScript animation libraries

The visual design integrates seamlessly with the existing Dyad web app while providing clear, accessible feedback for all file management operations.
