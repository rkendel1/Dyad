# Web App File Management Features

This document describes the file change management features implemented in the Dyad web application to provide parity with the desktop application.

## Features Implemented

### 1. Accept/Reject Proposals

**Location**: `web-app/src/components/proposal-display.tsx`

The web app now displays code proposals with detailed information about file changes, package additions, and database modifications. Users can:

- **View Proposals**: See all proposed changes before they are applied
- **Accept Changes**: Click the "Accept" button to approve and apply the changes
- **Reject Changes**: Click the "Reject" button to decline the proposed changes

#### Visual Enhancements:
- Color-coded file change types:
  - 🟢 **Write** (green): New or modified files
  - 🔴 **Delete** (red): Files to be removed
  - 🔵 **Rename** (blue): Files being renamed
- File path display for better context
- Package additions shown with purple badges
- SQL query descriptions with blue badges

### 2. Retry Messages

**Location**: `web-app/src/components/messages-display.tsx`, `web-app/src/components/app-details-page.tsx`

Users can retry the last message sent to the AI if they're unsatisfied with the response or if an error occurred.

**How it works**:
1. A "Retry Last Message" button appears at the bottom of the chat when messages exist
2. Clicking the button resends the most recent user message
3. The AI generates a new response
4. Loading state shows "Retrying..." while processing

**Use cases**:
- AI response was incomplete or incorrect
- Network error interrupted the previous response
- User wants to see alternative solutions

### 3. Commit Information Display

**Location**: `web-app/src/components/messages-display.tsx`

When proposals are approved, the web app displays:

- **Approval State**: Shows whether a proposal was approved ✅ or rejected ❌
- **Commit Hash**: Displays the first 7 characters of the git commit hash
- Visual indicators with colored icons for easy scanning

**Example**:
```
✅ Approved · 📝 a1b2c3d
```

### 4. Enhanced Message Type

**Location**: `packages/@dyad-sh/core/src/types/index.ts`

The `Message` type has been extended to include:

```typescript
export interface Message {
  id: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string | Date;
  approvalState?: "approved" | "rejected" | null;
  commitHash?: string | null;
}
```

This ensures that approval and commit information from the backend is properly typed and displayed.

## User Workflows

### Accepting a Proposal

1. **AI suggests changes**: After sending a message, the AI might propose file changes
2. **Review the proposal**: A highlighted proposal box appears showing:
   - Proposal title
   - Files to be changed with their types (write/delete/rename)
   - Packages to be added
   - Database queries to execute
3. **Accept or reject**: Click "Accept" to apply changes or "Reject" to dismiss
4. **View confirmation**: Once accepted, the message shows approval status and commit hash

### Retrying a Message

1. **Review AI response**: Read the assistant's response
2. **Decide to retry**: If unsatisfied or if an error occurred
3. **Click retry**: Press the "Retry Last Message" button at the bottom of the chat
4. **Wait for new response**: The last user message is resent and AI generates a new answer
5. **Compare results**: Review the new response

### Viewing Commit History

1. **Find approved messages**: Look for messages with ✅ Approved indicator
2. **Check commit hash**: See the 7-character commit hash next to the approval
3. **Reference in git**: Use the commit hash to view changes in git history

## Technical Implementation

### Backend API Endpoints

The web app uses the following HTTP API endpoints:

```
GET    /api/chats/:chatId/proposal        - Get current proposal for a chat
POST   /api/chats/:chatId/proposal/approve - Approve and apply a proposal
POST   /api/chats/:chatId/proposal/reject  - Reject a proposal
POST   /api/chats/:chatId/messages         - Send a message (used for retry)
GET    /api/chats/:chatId/messages         - Get messages with approval/commit info
```

### State Management

- **React Query**: Used for server state management and automatic cache invalidation
- **Local State**: Manages UI state like retry loading status
- **Optimistic Updates**: UI updates immediately for better user experience

### Data Flow

1. **Proposal Detection**: Messages are polled every 3 seconds to detect new proposals
2. **User Action**: Accept/Reject triggers API call
3. **Cache Invalidation**: React Query automatically refreshes affected data
4. **UI Update**: Components re-render with new approval state and commit info

## Future Enhancements

Potential additions for complete file management parity:

1. **File Diff Viewer**: Show actual code changes in a diff view
2. **File Browser**: View and navigate the app's file structure
3. **Commit History**: Full git log with browseable commits
4. **Rollback**: Revert to previous commits
5. **File Editor**: Edit files directly in the web interface
6. **Conflict Resolution**: Handle merge conflicts
7. **Branch Management**: Switch between git branches

## Browser Compatibility

Tested and works in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Considerations

- **Polling Interval**: Proposals checked every 3 seconds (configurable)
- **Message Polling**: Messages refreshed every 1-5 seconds during streaming
- **Retry Debouncing**: Retry button disabled during operation to prevent duplicates

## Security

- All API calls go through the authenticated Dyad Desktop backend
- No direct file system access from the browser
- Changes are validated and applied by the desktop application
- Git commits ensure full audit trail

## Troubleshooting

### Proposal not showing
- Ensure Dyad Desktop is running
- Check that API connection is active (health check)
- Verify the AI has completed its response

### Retry not working
- Confirm there is at least one user message in the chat
- Check network connection to Dyad Desktop
- Ensure no other operation is in progress

### Commit hash not appearing
- Verify the proposal was approved (not rejected)
- Check that the app has git initialized
- Ensure desktop app completed the commit operation

## Related Documentation

- [WEB_APP_PARITY_IMPLEMENTATION.md](./WEB_APP_PARITY_IMPLEMENTATION.md) - General web app features
- [HTTP_API_IMPLEMENTATION.md](./HTTP_API_IMPLEMENTATION.md) - Backend API details
- [FEATURE_OVERVIEW.md](./FEATURE_OVERVIEW.md) - Desktop app features
