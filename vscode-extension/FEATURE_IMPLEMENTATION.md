# VS Code Extension Feature Implementation Guide

This document describes the new features added to the Dyad VS Code extension.

## Important Note

The VS Code extension communicates with Dyad Desktop through IPC (Inter-Process Communication) handlers. The extension provides a convenient interface for features that are implemented in Dyad Desktop. For the new features to work:

1. **Dyad Desktop must be running** - The extension connects to Dyad Desktop on `http://localhost:3000`
2. **Backend support required** - The Dyad Desktop application needs to expose the following endpoints:
   - `GET /api/templates` - Get available templates (already exists via `get-templates` IPC handler)
   - `POST /api/apps` with `templateId` parameter - Create app with specific template
   - `POST /api/supabase/setup-local` - Setup local Supabase (uses existing `setup-local-supabase` IPC handler)
   - `POST /api/supabase/promote-to-production` - Promote to production (uses existing `promote-to-production` IPC handler)

The extension provides the UI/UX layer while Dyad Desktop handles the actual operations.

## Feature 1: AI-Powered Template Selection

### Overview

Users can now describe their app in natural language, and the extension will intelligently suggest the most appropriate templates based on the description.

### How It Works

1. **Natural Language Processing**: The extension analyzes user descriptions using keyword matching
2. **Template Scoring**: Each template is scored based on keyword relevance
3. **Smart Suggestions**: Templates are ranked by relevance and presented to the user
4. **User Confirmation**: Users can select from suggested templates or choose a different one

### Implementation Details

#### Template Matching Algorithm (`templateMatcher.ts`)

- **Exact Phrase Matching**: +10 points for exact keyword matches in the description
- **Word Matching**: +3 points for individual word matches
- **Title Matching**: +20 bonus points if the template title appears in the description
- **Fallback**: Returns React template as default when no matches are found

#### Supported Keywords by Template

- **React Template**: react, vite, simple, basic, starter, frontend, spa, single page
- **Next.js Template**: next, nextjs, ssr, server side, seo, full stack, web app
- **E-commerce Templates**: ecommerce, shop, store, payment, stripe, checkout, cart, product, sell
- **SaaS Template**: saas, subscription, billing, multi-tenant, auth, authentication, dashboard, admin
- **Blog Templates**: blog, mdx, content, cms, article, post, writing, markdown
- **Auth Template**: auth, authentication, login, signup, user, clerk, profile, role, permission
- **Dashboard Template**: dashboard, admin, analytics, chart, visualization, data, table, metrics

### Usage Example

```typescript
// User input: "I want to build an e-commerce store with payments"
// The extension will suggest:
// 1. Stripe E-commerce Template (highest score)
// 2. Medusa E-commerce Template
// 3. SaaS Starter Template (has some overlapping keywords)
```

### Command

- **Command ID**: `dyad.createAppWithTemplate`
- **Title**: "Dyad: Create App with AI Template Selection"
- **Workflow**:
  1. Prompt user for app description
  2. Analyze description and match templates
  3. Show ranked template suggestions
  4. User selects preferred template
  5. User enters app name
  6. App is created with selected template

## Feature 2: One-Click Local Supabase Setup

### Overview

Simplifies the process of connecting Dyad apps to a local Supabase instance with automatic configuration.

### How It Works

1. **Select App**: User selects which app to configure
2. **Auto-Configuration**: Extension calls the Dyad API to:
   - Start local Supabase containers (if not running)
   - Configure database credentials
   - Set up environment variables
   - Update app configuration files

### Implementation Details

#### API Endpoint

- **Method**: POST `/api/supabase/setup-local`
- **Payload**: `{ appId: number }`
- **Response**: `{ success: boolean; message?: string }`

#### What Gets Configured

- `POSTGRES_URL`: Local PostgreSQL connection string
- `SUPABASE_URL`: Local Supabase API URL (http://localhost:8000)
- `SUPABASE_ANON_KEY`: Local anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Local service role key
- `NEXT_PUBLIC_SUPABASE_URL`: Public URL for frontend
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key

### Command

- **Command ID**: `dyad.setupLocalSupabase`
- **Title**: "Dyad: Setup Local Supabase"

## Feature 3: Production Supabase Promotion

### Overview

Enables seamless transition from local Supabase to production with one-click promotion.

### How It Works

1. **Select App**: User selects app to promote
2. **Collect Credentials**: Extension prompts for production Supabase details:
   - Project reference
   - Supabase URL
   - Anon key
   - Service role key
   - Database password
3. **Automatic Migration**: Extension handles:
   - Database schema export
   - Environment variable updates
   - Configuration migration

### Implementation Details

#### API Endpoint

- **Method**: POST `/api/supabase/promote-to-production`
- **Payload**:

```typescript
{
  appId: number;
  productionProjectRef: string;
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  dbPassword: string;
}
```

- **Response**: `{ success: boolean; message?: string }`

#### Security Considerations

- Database password is entered using VS Code's password input (masked)
- Credentials are sent over local API connection
- Environment variables are securely stored in `.env` files

### Command

- **Command ID**: `dyad.promoteToProduction`
- **Title**: "Dyad: Promote to Production Supabase"

## Testing

### Template Matcher Tests

Run the test script to verify template matching:

```bash
cd vscode-extension
npx ts-node test-template-matcher.ts
```

Expected results:

- E-commerce description → Stripe E-commerce Template
- Blog description → MDX Blog Template
- Dashboard description → Admin Dashboard Template
- Auth description → Authentication Template
- SaaS description → SaaS Starter Template
- No match → React Template (default)

### Manual Testing

1. Install the extension in VS Code
2. Open Command Palette (Ctrl+Shift+P)
3. Test each new command:
   - "Dyad: Create App with AI Template Selection"
   - "Dyad: Setup Local Supabase"
   - "Dyad: Promote to Production Supabase"

## API Integration

The extension integrates with the Dyad Desktop API. Ensure these endpoints are available:

- `POST /api/apps` - Create app with template
- `GET /api/templates` - Get available templates
- `POST /api/supabase/setup-local` - Setup local Supabase
- `POST /api/supabase/promote-to-production` - Promote to production

## Error Handling

All commands include comprehensive error handling:

- Connection errors → Show "Dyad Desktop Required" message
- API errors → Display error message with details
- Validation errors → Show input validation messages
- Logging → All operations logged to "Dyad" output channel

## Future Enhancements

Potential improvements:

1. **Enhanced NLP**: Integrate with AI services for better description analysis
2. **Custom Templates**: Allow users to define their own template keywords
3. **Template Recommendations**: Learn from user selections to improve suggestions
4. **Batch Operations**: Setup Supabase for multiple apps at once
5. **Migration Wizard**: Guide users through production migration step-by-step

## Implementation Status

### ✅ Completed (VS Code Extension Side)

- [x] Template matching algorithm with keyword-based scoring
- [x] Natural language description input UI
- [x] Template suggestion and selection UI
- [x] Command for AI-powered template selection
- [x] Command for local Supabase setup
- [x] Command for production Supabase promotion
- [x] Comprehensive error handling
- [x] Documentation and usage guides

### ⚠️ Backend Integration Required

For full functionality, Dyad Desktop needs to:

- [ ] Expose REST API endpoints (or ensure IPC handlers are accessible via HTTP)
- [ ] Support `templateId` parameter in app creation
- [ ] Map HTTP API calls to existing IPC handlers

### Current Workaround

The extension is designed to work with the existing IPC handlers through an HTTP API layer. If the HTTP API is not yet available:

1. The template selection UI will still work for gathering user intent
2. The selected template information can be displayed
3. Users can then create apps through Dyad Desktop with the suggested template

The Supabase features should work as they use existing IPC handlers that are already exposed.
