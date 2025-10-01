# VS Code Extension - Visual UI Guide

This document illustrates what users will see when using the new features.

## Feature 1: AI-Powered Template Selection

### Step 1: Opening the Command

**Command Palette View:**

```
> Dyad: Create App with AI Template Selection
```

### Step 2: Describing the App

**Input Box:**

```
Describe the app you want to build (e.g., "an e-commerce store with payments")
┌─────────────────────────────────────────────────────────────┐
│ I want to build an online store with Stripe payments       │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Template Suggestions

**Quick Pick Menu:**

```
Choose App Template
────────────────────────────────────────────────────────────────
┌─ Stripe E-commerce Template                                  ┐
│  Next.js e-commerce store with Stripe payments, product      │
│  catalog, shopping cart, and checkout flow.                  │
│  Relevance score: 42                                          │
└───────────────────────────────────────────────────────────────┘

┌─ Medusa E-commerce Template                                  ┐
│  Headless commerce template with Medusa backend, cart        │
│  functionality, and modern storefront.                        │
│  Relevance score: 26                                          │
└───────────────────────────────────────────────────────────────┘

┌─ SaaS Starter Template                                       ┐
│  Full-stack SaaS boilerplate with authentication,            │
│  subscription billing, multi-tenancy, and admin dashboard.   │
│  Relevance score: 18                                          │
└───────────────────────────────────────────────────────────────┘
```

### Step 4: Name Your App

**Input Box:**

```
Enter the name for your new Dyad app
┌─────────────────────────────────────────────────────────────┐
│ my-store                                                     │
└─────────────────────────────────────────────────────────────┘
Validation: App name can only contain letters, numbers, hyphens, and underscores
```

### Step 5: Success

**Information Message:**

```
✓ App "my-store" created successfully with Stripe E-commerce Template!
```

**Sidebar Update:**

```
DYAD: APPS
└─ 🔵 my-store
   /Users/username/dyad-apps/my-store
```

**Output Channel:**

```
[Dyad] Analyzing description: I want to build an online store with Stripe payments
[Dyad] Found 3 matching templates
[Dyad] Best match: Stripe E-commerce Template
[Dyad] Selected template: Stripe E-commerce Template (stripe-ecommerce)
[Dyad] Creating app: my-store with template: stripe-ecommerce
[Dyad] App "my-store" created successfully
```

## Feature 2: One-Click Local Supabase Setup

### Step 1: Opening the Command

**Command Palette View:**

```
> Dyad: Setup Local Supabase
```

### Step 2: Select Your App

**Quick Pick Menu:**

```
Select an app to setup local Supabase
────────────────────────────────────────────────────────────────
┌─ my-store                                                    ┐
│  /Users/username/dyad-apps/my-store                          │
└───────────────────────────────────────────────────────────────┘

┌─ my-blog                                                     ┐
│  /Users/username/dyad-apps/my-blog                           │
└───────────────────────────────────────────────────────────────┘

┌─ my-dashboard                                                ┐
│  /Users/username/dyad-apps/my-dashboard                      │
└───────────────────────────────────────────────────────────────┘
```

### Step 3: Processing

**Output Channel:**

```
[Dyad] Setting up local Supabase for app: my-store (ID: 1)
[Dyad] Starting local Supabase containers...
[Dyad] Configuring environment variables...
[Dyad] Database connection established
[Dyad] Local Supabase setup completed for app: my-store
```

### Step 4: Success

**Information Message:**

```
✓ Local Supabase setup successfully for "my-store"!
```

**Environment Variables Created (.env.local):**

```
POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Access Points:**

```
🌐 Dashboard: http://localhost:3001
📊 API: http://localhost:8000
🔌 Database: postgresql://postgres@localhost:5432/postgres
```

## Feature 3: Production Supabase Promotion

### Step 1: Opening the Command

**Command Palette View:**

```
> Dyad: Promote to Production Supabase
```

### Step 2: Select Your App

**Quick Pick Menu:**

```
Select an app to promote to production Supabase
────────────────────────────────────────────────────────────────
┌─ my-store                                                    ┐
│  /Users/username/dyad-apps/my-store                          │
└───────────────────────────────────────────────────────────────┘
```

### Step 3: Enter Project Reference

**Input Box:**

```
Enter your production Supabase project reference
┌─────────────────────────────────────────────────────────────┐
│ abcdefghijklmnop                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Enter Supabase URL

**Input Box:**

```
Enter your production Supabase URL
┌─────────────────────────────────────────────────────────────┐
│ https://abcdefghijklmnop.supabase.co                        │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: Enter Anon Key

**Input Box:**

```
Enter your production Supabase anon key
┌─────────────────────────────────────────────────────────────┐
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYm... │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: Enter Service Role Key

**Input Box:**

```
Enter your production Supabase service role key
┌─────────────────────────────────────────────────────────────┐
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYm... │
└─────────────────────────────────────────────────────────────┘
```

### Step 7: Enter Database Password

**Password Input Box:**

```
Enter your production Supabase database password
┌─────────────────────────────────────────────────────────────┐
│ ••••••••••••••••                                            │
└─────────────────────────────────────────────────────────────┘
```

### Step 8: Processing

**Output Channel:**

```
[Dyad] Promoting app: my-store (ID: 1) to production
[Dyad] Exporting local database schema...
[Dyad] Updating environment variables...
[Dyad] Configuring production settings...
[Dyad] Production promotion completed for app: my-store
```

### Step 9: Success

**Information Message:**

```
✓ Successfully promoted "my-store" to production Supabase!
```

**Production Environment Variables (.env.production):**

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
POSTGRES_URL=postgresql://postgres:***@db.abcdefghijklmnop.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Scenarios

### Connection Error

**When Dyad Desktop is not running:**

```
⚠ Cannot connect to Dyad Desktop. Please make sure it is running.

┌─────────────────────────────────────────────────────────────┐
│ This feature requires Dyad Desktop to be running.           │
│ Please launch Dyad Desktop and try again.                   │
│                                                              │
│ [Open Dyad Website]  [Check Connection]                     │
└─────────────────────────────────────────────────────────────┘
```

### Validation Error

**Invalid app name:**

```
Enter the name for your new Dyad app
┌─────────────────────────────────────────────────────────────┐
│ my store!                                                    │
└─────────────────────────────────────────────────────────────┘
❌ App name can only contain letters, numbers, hyphens, and underscores
```

### No Apps Available

**When no apps exist:**

```
ℹ No apps available. Create one first using Dyad Desktop or the "Create New App" command.
```

## Sidebar Integration

**Apps View:**

```
DYAD: APPS
├─ 🟢 my-store (Running)
│  /Users/username/dyad-apps/my-store
├─ ⚪ my-blog
│  /Users/username/dyad-apps/my-blog
└─ 🟢 my-dashboard (Running)
   /Users/username/dyad-apps/my-dashboard

DYAD: QUICK ACTIONS
├─ ➕ Create New App
├─ 🤖 Create App with AI Template Selection
├─ ▶️  Run App
├─ ⏹️  Stop App
├─ 🗄️  Setup Local Supabase
├─ 🚀 Promote to Production Supabase
└─ 🔄 Refresh
```

## Output Channel Logging

**Comprehensive Logging:**

```
[Dyad] Dyad extension is now active
[Dyad] ✓ Successfully connected to Dyad Desktop
[Dyad] Analyzing description: I want to build an online store with Stripe payments
[Dyad] Found 3 matching templates
[Dyad] Best match: Stripe E-commerce Template
[Dyad] Selected template: Stripe E-commerce Template (stripe-ecommerce)
[Dyad] Creating app: my-store with template: stripe-ecommerce
[Dyad] App "my-store" created successfully
[Dyad] Setting up local Supabase for app: my-store (ID: 1)
[Dyad] Local Supabase setup completed for app: my-store
```

## Command Palette Quick Access

**Type "Dyad" in Command Palette:**

```
> Dyad

Results:
─────────────────────────────────────────────────
Dyad: Create New App
Dyad: Create App with AI Template Selection  ⭐ NEW
Dyad: Run App
Dyad: Stop App
Dyad: Setup Local Supabase  ⭐ NEW
Dyad: Promote to Production Supabase  ⭐ NEW
Dyad: Open Console
Dyad: Send CLI Command
Dyad: Refresh Sidebar
Dyad: Check Connection to Dyad Desktop
```

## Tips and Indicators

**Status Bar (if implemented):**

```
🟢 Dyad Desktop: Connected    |    📦 3 Apps    |    🔵 2 Running
```

**Notifications:**

```
✓ Success messages (green checkmark)
⚠ Warning messages (yellow warning)
❌ Error messages (red X)
ℹ Info messages (blue i)
```

This visual guide shows the complete user experience for all three new features!
