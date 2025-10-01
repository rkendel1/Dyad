# Extension Testing Checklist

This document provides a comprehensive checklist for testing the Dyad VS Code Extension.

## Prerequisites

- [ ] VS Code 1.80.0 or higher installed
- [ ] Node.js 20 or higher installed
- [ ] Extension compiled (`npm run compile`)
- [ ] Sanity checks pass (`npm run test-sanity`)

## Testing Scenarios

### Scenario 1: Extension Activation (Without Dyad Desktop)

**Setup**: Dyad Desktop is NOT running

1. [ ] Install the extension in VS Code (F5 in development or install .vsix)
2. [ ] Extension activates without crashing
3. [ ] Warning notification appears: "Dyad Desktop is not running..."
4. [ ] Dyad icon appears in Activity Bar
5. [ ] Output channel "Dyad" is created (View → Output → Dyad)
6. [ ] Output shows: "Warning: Cannot connect to Dyad Desktop"

### Scenario 2: Sidebar View (Without Dyad Desktop)

**Setup**: Dyad Desktop is NOT running

1. [ ] Click Dyad icon in Activity Bar
2. [ ] Sidebar opens showing two sections: "Apps" and "Quick Actions"
3. [ ] Apps section shows:
   - [ ] "Cannot connect to Dyad Desktop" error
   - [ ] "Make sure Dyad Desktop is running" help text
   - [ ] "Check Connection" action item
4. [ ] Quick Actions section shows all action items

### Scenario 3: Health Check Command

**Setup**: Dyad Desktop is NOT running

1. [ ] Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. [ ] Type "Dyad: Check Connection"
3. [ ] Execute command
4. [ ] Warning message appears: "✗ Cannot connect to Dyad Desktop..."
5. [ ] Output channel shows: "✗ Failed to connect to Dyad Desktop"
6. [ ] Dialog offers "Open Dyad Website" and "Check Connection" options

### Scenario 4: Create App Command (Without Dyad Desktop)

**Setup**: Dyad Desktop is NOT running

1. [ ] Open Command Palette
2. [ ] Execute "Dyad: Create New App"
3. [ ] Input dialog appears
4. [ ] Enter app name
5. [ ] Error message appears explaining Dyad Desktop is required
6. [ ] Output channel shows detailed error

### Scenario 5: Extension Activation (With Dyad Desktop)

**Setup**: Dyad Desktop IS running on http://localhost:3000

1. [ ] Reload VS Code window (Developer: Reload Window)
2. [ ] Extension activates successfully
3. [ ] Output shows: "✓ Successfully connected to Dyad Desktop"
4. [ ] No error notifications appear

### Scenario 6: Sidebar View (With Dyad Desktop)

**Setup**: Dyad Desktop IS running

1. [ ] Open Dyad sidebar
2. [ ] Apps section shows list of apps (or "No apps found" if none exist)
3. [ ] Each app shows:
   - [ ] App name
   - [ ] Status indicator (🟢 for running, ⚪ for stopped)
   - [ ] Description showing status
   - [ ] Tooltip with app details on hover
4. [ ] Quick Actions section shows all actions

### Scenario 7: Health Check (With Dyad Desktop)

**Setup**: Dyad Desktop IS running

1. [ ] Execute "Dyad: Check Connection to Dyad Desktop"
2. [ ] Success message appears: "✓ Successfully connected to Dyad Desktop"
3. [ ] Output channel shows: "✓ Dyad Desktop is running and accessible"

### Scenario 8: Create App (With Dyad Desktop & CLI Available)

**Setup**: Dyad Desktop running, CLI available

1. [ ] Execute "Dyad: Create New App"
2. [ ] Input validation works:
   - [ ] Empty names are rejected
   - [ ] Invalid characters are rejected
   - [ ] Valid names are accepted
3. [ ] App is created successfully
4. [ ] Success message appears
5. [ ] Sidebar refreshes automatically
6. [ ] New app appears in sidebar

### Scenario 9: Run App (With Dyad Desktop)

**Setup**: Dyad Desktop running, apps exist

1. [ ] Execute "Dyad: Run App"
2. [ ] Quick pick shows all apps with descriptions
3. [ ] Select an app
4. [ ] App runs successfully (or shows appropriate error)
5. [ ] Success message appears
6. [ ] Output channel logs the operation
7. [ ] Sidebar refreshes to show updated status

### Scenario 10: Stop App (With Dyad Desktop)

**Setup**: Dyad Desktop running, app is running

1. [ ] Execute "Dyad: Stop App"
2. [ ] Quick pick shows only running apps
3. [ ] Select a running app
4. [ ] App stops successfully
5. [ ] Success message appears
6. [ ] Output channel logs the operation
7. [ ] Sidebar refreshes to show updated status

### Scenario 11: Refresh Sidebar

1. [ ] Execute "Dyad: Refresh Sidebar"
2. [ ] Sidebar content updates
3. [ ] Success message appears
4. [ ] Output channel logs the refresh

### Scenario 12: Input Validation

Test various inputs for commands:

1. [ ] Create App with empty name → Rejected with message
2. [ ] Create App with special characters → Rejected with message
3. [ ] Create App with valid name → Accepted
4. [ ] Send CLI Command with empty input → Rejected with message
5. [ ] Send CLI Command with valid input → Accepted

### Scenario 13: Error Recovery

1. [ ] Start with Dyad Desktop running
2. [ ] Extension connects successfully
3. [ ] Stop Dyad Desktop
4. [ ] Try to run a command
5. [ ] Error message indicates connection lost
6. [ ] Restart Dyad Desktop
7. [ ] Run health check command
8. [ ] Extension reconnects successfully

### Scenario 14: Sidebar Interactions

1. [ ] Click on app in sidebar → Select App command executes (if implemented)
2. [ ] Click on action items → Corresponding commands execute
3. [ ] Click "Check Connection" in error state → Health check runs
4. [ ] Click "Create an app" help item → Create command runs

### Scenario 15: Output Channel Logging

1. [ ] Open Output panel (View → Output)
2. [ ] Select "Dyad" from dropdown
3. [ ] Execute various commands
4. [ ] Verify each command logs:
   - [ ] Operation start
   - [ ] Operation result or error
   - [ ] Detailed error messages when failures occur

## Edge Cases

### Edge Case 1: Port Conflict

- [ ] Another service running on port 3000
- [ ] Extension shows appropriate error
- [ ] Suggests checking for port conflicts

### Edge Case 2: Partial Dyad Desktop Failure

- [ ] Dyad Desktop running but API not responding
- [ ] Timeout occurs (10 seconds)
- [ ] Appropriate timeout error shown

### Edge Case 3: Network Issues

- [ ] Simulate slow network
- [ ] Operations timeout appropriately
- [ ] No extension crashes

### Edge Case 4: Invalid App IDs

- [ ] Try to run/stop non-existent app
- [ ] Graceful error handling
- [ ] No extension crashes

## Performance Checks

1. [ ] Extension activates quickly (< 2 seconds)
2. [ ] Health check completes quickly (< 5 seconds)
3. [ ] Health check results are cached (subsequent calls are instant)
4. [ ] Sidebar loads without delay
5. [ ] No memory leaks after multiple operations

## Documentation Verification

1. [ ] README.md accurately describes features
2. [ ] README.md troubleshooting section is helpful
3. [ ] DEVELOPMENT.md explains architecture correctly
4. [ ] All commands are documented
5. [ ] Error messages match documentation

## Build & Package Checks

1. [ ] `npm run compile` succeeds without errors
2. [ ] `npm run lint` passes (or shows only warnings)
3. [ ] `npm run test-sanity` passes all checks
4. [ ] `npm run package` creates .vsix file successfully
5. [ ] .vsix file can be installed in VS Code
6. [ ] Installed extension works correctly

## Final Verification

1. [ ] All commands work as expected
2. [ ] Error messages are clear and actionable
3. [ ] User guidance is helpful
4. [ ] No console errors in Developer Tools
5. [ ] Extension logs useful information
6. [ ] Extension can be safely deactivated
7. [ ] Extension can be safely reactivated

## Known Limitations (Document These)

1. [ ] CLI commands may not be available (Dyad is primarily desktop app)
2. [ ] Requires Dyad Desktop to be running for most features
3. [ ] No real-time status updates (manual refresh required)
4. [ ] API endpoints may vary (document actual endpoints)

## Sign-off

- [ ] All critical scenarios pass
- [ ] All edge cases handled gracefully
- [ ] Documentation is complete and accurate
- [ ] Extension is ready for release

---

**Test Date**: **\*\*\*\***\_**\*\*\*\***

**Tested By**: **\*\*\*\***\_**\*\*\*\***

**VS Code Version**: **\*\*\*\***\_**\*\*\*\***

**Dyad Desktop Version**: **\*\*\*\***\_**\*\*\*\***

**Notes**:
