# Dyad VS Code Extension - Feature Demo Script

This script demonstrates the new features added to the Dyad VS Code extension.

## Prerequisites
- VS Code installed
- Dyad Desktop running on `http://localhost:3000`
- Dyad VS Code extension installed

## Demo 1: AI-Powered Template Selection

### Scenario: User wants to create an e-commerce app

1. **Open Command Palette**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Run Template Selection Command**
   - Type: `Dyad: Create App with AI Template Selection`
   - Press Enter

3. **Describe Your App**
   - Input: "I want to build an online store with Stripe payments and shopping cart"
   - Press Enter

4. **Review Suggested Templates**
   - The extension analyzes your description
   - Shows ranked templates:
     ```
     1. Stripe E-commerce Template
        Next.js e-commerce store with Stripe payments, product catalog, shopping cart, and checkout flow.
        Relevance score: 42

     2. Medusa E-commerce Template
        Headless commerce template with Medusa backend, cart functionality, and modern storefront.
        Relevance score: 26

     3. SaaS Starter Template
        Full-stack SaaS boilerplate with authentication, subscription billing, multi-tenancy, and admin dashboard.
        Relevance score: 18
     ```

5. **Select Template**
   - Select "Stripe E-commerce Template"
   - Press Enter

6. **Name Your App**
   - Input: "my-store"
   - Press Enter

7. **App Created!**
   - Success message: "App 'my-store' created successfully with Stripe E-commerce Template!"
   - Check sidebar to see your new app

### Other Example Descriptions to Try

**Blog/Content**
- "I need a blog for writing articles with markdown support"
- Result: MDX Blog Template

**Dashboard**
- "admin dashboard with charts and analytics"
- Result: Admin Dashboard Template

**Authentication**
- "app with user login and role-based access"
- Result: Authentication Template

**SaaS**
- "SaaS application with subscription billing"
- Result: SaaS Starter Template

**Simple App**
- "basic React app to get started"
- Result: React.js Template

## Demo 2: One-Click Local Supabase Setup

### Scenario: Add database to your app

1. **Open Command Palette**
   - Press `Ctrl+Shift+P` or `Cmd+Shift+P`

2. **Run Supabase Setup Command**
   - Type: `Dyad: Setup Local Supabase`
   - Press Enter

3. **Select Your App**
   - Choose from the list of your apps
   - Example: "my-store"
   - Press Enter

4. **Automatic Configuration**
   - Extension sends request to Dyad Desktop
   - Dyad Desktop:
     - Starts local Supabase containers (if not running)
     - Configures database connection
     - Updates environment variables in `.env.local`:
       ```
       POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
       SUPABASE_URL=http://localhost:8000
       SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
       NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       ```

5. **Success!**
   - Message: "Local Supabase setup successfully for 'my-store'!"
   - You can now use Supabase in your app
   - Dashboard available at: http://localhost:3001

### What You Can Do Now
- Open Supabase dashboard: http://localhost:3001
- Create database tables
- Set up authentication
- Write database queries in your app
- Test everything locally

## Demo 3: Promote to Production Supabase

### Scenario: Deploy your app to production

**Prerequisites:**
- Local Supabase setup completed
- Production Supabase project created at https://supabase.com
- Production credentials ready

1. **Open Command Palette**
   - Press `Ctrl+Shift+P` or `Cmd+Shift+P`

2. **Run Promotion Command**
   - Type: `Dyad: Promote to Production Supabase`
   - Press Enter

3. **Select Your App**
   - Choose: "my-store"
   - Press Enter

4. **Enter Project Reference**
   - Input: "abcdefghijklmnop" (your actual project ref)
   - Press Enter

5. **Enter Supabase URL**
   - Pre-filled: "https://abcdefghijklmnop.supabase.co"
   - Verify and press Enter

6. **Enter Anon Key**
   - Paste your production anon key
   - Press Enter

7. **Enter Service Role Key**
   - Paste your production service role key
   - Press Enter

8. **Enter Database Password**
   - Input is hidden for security
   - Enter your production database password
   - Press Enter

9. **Automatic Migration**
   - Dyad Desktop:
     - Exports local database schema
     - Updates environment variables
     - Configures production settings
     - Creates `.env.production` file

10. **Success!**
    - Message: "Successfully promoted 'my-store' to production Supabase!"
    - Your app is now configured for production
    - Environment variables updated:
      ```
      SUPABASE_URL=https://abcdefghijklmnop.supabase.co
      SUPABASE_ANON_KEY=<production-anon-key>
      SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
      POSTGRES_URL=postgresql://postgres:***@db.abcdefghijklmnop.supabase.co:5432/postgres
      ```

### Next Steps After Promotion
1. Review and apply database schema in production Supabase dashboard
2. Configure Row Level Security (RLS) policies
3. Test your app with production Supabase
4. Deploy your app to production hosting

## Tips and Best Practices

### Template Selection
- Be specific in your description: "e-commerce with Stripe" vs "online store"
- Mention key features: "authentication", "payments", "blog", "dashboard"
- Use industry terms: "SaaS", "CMS", "admin panel"

### Supabase Setup
- Always test locally before promoting to production
- Keep your production credentials secure
- Use different Supabase projects for dev/staging/prod
- Back up your production database regularly

### Troubleshooting
- If commands don't work, check that Dyad Desktop is running
- View logs in VS Code Output panel (View → Output → Dyad)
- Use "Dyad: Check Connection to Dyad Desktop" to verify connectivity

## Video Demo (Conceptual Storyboard)

### Scene 1: Template Selection (0:00-0:30)
- User opens Command Palette
- Types description: "blog with markdown"
- Sees MDX Blog Template suggested
- Creates app with one click

### Scene 2: Supabase Setup (0:30-1:00)
- User runs "Setup Local Supabase"
- Selects app from list
- Containers start automatically
- Environment configured
- Dashboard opens in browser

### Scene 3: Production Promotion (1:00-1:30)
- User runs "Promote to Production"
- Enters Supabase credentials
- Migration happens automatically
- App ready for production
- Shows before/after environment variables

## Conclusion

These features make Dyad app development faster and more intuitive:
- **AI Template Selection**: Get the right template based on natural language
- **One-Click Supabase**: No manual configuration needed
- **Easy Production**: Seamless transition from local to production

All features work together to streamline the development workflow!
