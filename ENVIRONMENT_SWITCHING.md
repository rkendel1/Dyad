# Supabase Environment Switching Guide

This guide explains how to easily switch between local and hosted Supabase environments in your Dyad apps.

## Overview

Dyad now provides a streamlined way to switch between local development Supabase and hosted production Supabase environments. The new `.env.local` structure supports both configurations in a single file, with clear sections that can be easily enabled or disabled.

## Quick Start

### Using the Environment Switcher Script

The easiest way to switch environments is using the provided script:

```bash
# Switch to local Supabase
npm run supabase:switch <app-path> local

# Switch to hosted Supabase
npm run supabase:switch <app-path> hosted
```

### Manual Switching

You can also manually edit your `.env.local` file. The file is structured with clear sections:

```bash
# ============================================
# LOCAL SUPABASE (Development)
# ============================================
# Uncomment these when using local Supabase
POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ... other local variables
# ============================================

# ============================================
# HOSTED SUPABASE (Production/Staging)
# ============================================
# Uncomment these when using hosted Supabase
# POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
# SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# ... other hosted variables
# ============================================
```

To switch manually:

1. Comment out the section you're not using (add `#` at the start of each line)
2. Uncomment the section you want to use (remove `#` from the start of each line)
3. Restart your development server

## Detailed Usage

### Switching to Local Supabase

When you want to develop locally with containerized Supabase:

```bash
# 1. Start local Supabase if not running
npm run supabase:start

# 2. Switch your app to use local Supabase
npm run supabase:switch ./path/to/your/app local

# 3. Restart your development server
```

**What happens:**

- All `LOCAL SUPABASE` section variables become active (uncommented)
- All `HOSTED SUPABASE` section variables are commented out
- Your app now connects to `http://localhost:8000`

**Benefits of local development:**

- No internet connection required (after initial setup)
- Faster development cycle
- Easy database resets for testing
- No API rate limits
- Free to use

### Switching to Hosted Supabase

When you want to test with or deploy to production Supabase:

```bash
# 1. Make sure you've promoted to production (if not already done)
npm run supabase:promote

# 2. Switch your app to use hosted Supabase
npm run supabase:switch ./path/to/your/app hosted

# 3. Restart your development server
```

**What happens:**

- All `HOSTED SUPABASE` section variables become active (uncommented)
- All `LOCAL SUPABASE` section variables are commented out
- Your app now connects to your hosted Supabase project

**When to use hosted:**

- Testing with production data
- Deploying to production/staging
- Working with team members on shared database
- Testing authentication flows with real OAuth
- Testing with production-scale data

## Environment File Structure

### New Structure (Recommended)

The new `.env.local` structure uses clear section markers:

```bash
# ============================================
# Supabase Configuration
# ============================================
# This file supports both local and hosted Supabase.

# ============================================
# LOCAL SUPABASE (Development)
# ============================================
POSTGRES_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# ============================================

# ============================================
# HOSTED SUPABASE (Production/Staging)
# ============================================
# POSTGRES_URL=...
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# ============================================
```

**Advantages:**

- Both configurations always present in the file
- Easy to switch by commenting/uncommenting
- Clear visual separation between environments
- No need to remember credentials
- Safer transitions (credentials never lost)

### Legacy Structure

The old structure had separate variables without sections:

```bash
POSTGRES_URL=...
SUPABASE_URL=...
# etc.
```

**Migration:**

- The new handlers will automatically create the structured format
- Existing files continue to work
- You can manually reorganize if desired

## Workflow Examples

### Example 1: Starting a New Project

```bash
# 1. Start local Supabase
npm run supabase:start

# 2. Create your app (using Dyad UI)

# 3. Connect to local Supabase (using Dyad UI)
# This automatically creates structured .env.local

# 4. Develop your app locally
# Database schema, test data, etc.

# 5. When ready for production
npm run supabase:promote

# 6. Switch to production for testing
npm run supabase:switch ./my-app hosted

# 7. Deploy your app
```

### Example 2: Working on Existing Project

```bash
# Working with production data
npm run supabase:switch ./my-app hosted

# Make some changes, need to test locally
npm run supabase:start
npm run supabase:switch ./my-app local

# Test changes locally
# ...

# Switch back to production for deployment
npm run supabase:switch ./my-app hosted
```

### Example 3: Multiple Apps with Different Environments

```bash
# App 1: Use local Supabase for development
npm run supabase:switch ./app1 local

# App 2: Use hosted Supabase for production testing
npm run supabase:switch ./app2 hosted

# App 3: Another app on local
npm run supabase:switch ./app3 local
```

## Troubleshooting

### "No .env.local file found"

**Problem:** The switcher can't find your environment file.

**Solution:**

1. Make sure you've connected your app to Supabase first (using Dyad UI)
2. Check that the app path is correct
3. The file might be in `.dyad/.env.local` instead

### "No hosted configuration found"

**Problem:** Trying to switch to hosted, but no hosted credentials exist.

**Solution:**

1. Run `npm run supabase:promote` first to set up production
2. This will create the hosted section in your `.env.local`

### Changes not taking effect

**Problem:** Switched environments but app still uses old connection.

**Solution:**

1. Make sure to restart your development server after switching
2. Check that the correct variables are uncommented in `.env.local`
3. Clear any environment variable caches

### Both sections are commented out

**Problem:** Accidentally commented out both sections.

**Solution:**

1. Run the switch command again: `npm run supabase:switch <app> local`
2. Or manually uncomment the section you need

## Best Practices

### 1. Keep Both Configurations Updated

When you update hosted credentials:

- Update the `HOSTED SUPABASE` section in `.env.local`
- Keep local section for development

### 2. Use Version Control Wisely

```bash
# .gitignore
.env.local      # Contains secrets, don't commit
.env.production # Contains production secrets, don't commit
```

### 3. Document Your Environment

Add a note in your project README:

```markdown
## Supabase Setup

This app uses Supabase. To switch environments:

- Local: `npm run supabase:switch . local`
- Hosted: `npm run supabase:switch . hosted`

Make sure to restart the dev server after switching.
```

### 4. Test Before Deploying

Always test with hosted Supabase before deploying:

```bash
# Switch to hosted
npm run supabase:switch ./my-app hosted

# Test thoroughly
npm run dev

# If issues, switch back to local
npm run supabase:switch ./my-app local
```

### 5. Keep Local Supabase Running

If you frequently switch between environments:

```bash
# Keep local Supabase running in background
npm run supabase:start

# Switch as needed without restarting services
npm run supabase:switch <app> local
npm run supabase:switch <app> hosted
```

## Advanced Usage

### Custom Environment Files

If you use custom environment file locations:

```bash
# Edit the script to use your custom path
node scripts/switch-supabase-env.js ./custom/path/.env.custom local
```

### Automated Switching in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Switch to production Supabase
  run: npm run supabase:switch ./app hosted

- name: Run tests
  run: npm test

- name: Deploy
  run: npm run deploy
```

### Multiple Environments

You can extend the structure for staging:

```bash
# ============================================
# STAGING SUPABASE
# ============================================
# POSTGRES_URL=postgresql://postgres:password@db.staging-project.supabase.co:5432/postgres
# SUPABASE_URL=https://staging-project.supabase.co
# ... etc
# ============================================
```

## Related Documentation

- [Local Supabase Setup](./LOCAL_SUPABASE.md)
- [Production Promotion Guide](./PRODUCTION_PROMOTION.md)
- [Supabase Official Docs](https://supabase.com/docs)

## Support

If you encounter issues:

1. Check this documentation
2. Verify both local and hosted Supabase are properly set up
3. Review the environment file structure
4. Open an issue on the Dyad repository with details
