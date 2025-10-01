# Supabase Production Promotion Guide

This guide explains how to promote your local Supabase development environment to a production Supabase instance. This feature streamlines the transition from local development to production by automating schema migration, environment configuration, and providing clear guidance for data migration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Using the CLI Tool](#using-the-cli-tool)
4. [Using the Dyad UI](#using-the-dyad-ui)
5. [Manual Process](#manual-process)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Security Considerations](#security-considerations)

## Prerequisites

Before starting the production promotion process, ensure you have:

### Required

- **Local Supabase running**: Your local development environment must be active
- **Supabase account**: An active Supabase account with project creation permissions
- **PostgreSQL tools**: `pg_dump` and `psql` installed on your system
- **Tested local environment**: Your local application should be working correctly
- **Environment backups**: Backup any important data or configurations

### Recommended

- **Organization setup**: A Supabase organization for your production projects
- **Database password**: A strong password for your production database
- **Monitoring setup**: Plan for logging and monitoring in production
- **Backup strategy**: A plan for regular production database backups

## Quick Start

### Option 1: Using npm script (Recommended)

```bash
# Start the promotion process
npm run supabase:promote
```

### Option 2: Using the script directly

```bash
# Run the promotion script
node scripts/promote-to-production.js
```

### Option 3: Using Dyad UI

1. Open your Dyad application
2. Navigate to your app's Supabase settings
3. Click "Promote to Production"
4. Follow the guided process

## Using the CLI Tool

The CLI tool (`scripts/promote-to-production.js`) provides an interactive wizard that guides you through the entire promotion process.

### Step-by-Step Process

1. **Prerequisites Check**
   - Verifies local Supabase is running
   - Validates required tools are available
   - Confirms working directory

2. **Project Configuration**
   - Choose to create new or use existing project
   - Provide production project details
   - Configure database credentials

3. **Schema Migration**
   - Automatically extracts local database schema
   - Provides SQL file for production deployment
   - Guides manual schema application

4. **Function Migration**
   - Identifies Supabase functions to migrate
   - Provides guidance for manual function deployment
   - Validates function deployment

5. **Environment Configuration**
   - Updates `.env.local` with production values
   - Creates `.env.production` file
   - Configures all necessary environment variables

6. **Optional Data Migration**
   - Provides guidance for data migration
   - Recommends safe migration strategies
   - Validates data migration completion

7. **Post-Migration Validation**
   - Checks all components are working
   - Provides validation checklist
   - Confirms successful promotion

### CLI Options

```bash
# Show help
node scripts/promote-to-production.js help

# Start promotion process
node scripts/promote-to-production.js promote
# or simply
node scripts/promote-to-production.js
```

## Using the Dyad UI

The Dyad application provides a user-friendly interface for production promotion:

### Access the Feature

1. Open Dyad application
2. Select your app
3. Go to Integrations → Supabase
4. Click "Promote to Production" button

### UI-Guided Process

The UI will guide you through:

- Project selection or creation
- Credential input with validation
- Progress tracking for each step
- Error handling and retry options
- Success confirmation and next steps

## Manual Process

If you prefer to handle the promotion manually or need to customize the process:

### 1. Create Production Project

```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Configure project settings
```

### 2. Extract Local Schema

```bash
# Export schema from local Supabase
pg_dump "postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres" \
  --schema-only --no-owner --no-privileges > production-schema.sql
```

### 3. Apply Schema to Production

```bash
# Apply schema to production database
psql "postgresql://postgres:YOUR_PRODUCTION_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  -f production-schema.sql
```

### 4. Update Environment Files

Create or update your `.env.production` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTGRES_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Deploy Functions (if applicable)

For each function in `supabase/functions/`:

1. Go to Supabase Dashboard → Functions
2. Create new function with same name
3. Copy function code
4. Deploy function

### 6. Migrate Data (optional)

```bash
# Export data from local
pg_dump "postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres" \
  --data-only --no-owner --no-privileges > production-data.sql

# Import to production (carefully!)
psql "postgresql://postgres:YOUR_PRODUCTION_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  -f production-data.sql
```

## Troubleshooting

### Common Issues and Solutions

#### Local Supabase Not Running

```bash
Error: Local Supabase is not running
Solution: Start local Supabase first
npm run supabase:start
```

#### PostgreSQL Tools Not Found

```bash
Error: pg_dump command not found
Solution: Install PostgreSQL client tools
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql-client
# On Windows: Download from postgresql.org
```

#### Schema Migration Fails

```bash
Error: Schema migration failed
Solutions:
1. Check database permissions
2. Verify production database is accessible
3. Review schema for incompatible elements
4. Apply schema manually using Supabase SQL editor
```

#### Environment File Issues

```bash
Error: Unable to update environment files
Solutions:
1. Check file permissions
2. Ensure app path is correct
3. Manually update .env files if needed
```

#### Function Deployment Issues

```bash
Error: Function deployment failed
Solutions:
1. Deploy functions manually via Supabase dashboard
2. Check function code for production compatibility
3. Verify function dependencies are available
```

### Debug Mode

For detailed logging, set the debug environment variable:

```bash
DEBUG=1 npm run supabase:promote
```

### Getting Help

If you encounter issues:

1. Check this documentation
2. Review the error messages carefully
3. Check Supabase dashboard for project status
4. Verify local Supabase is running properly
5. Check PostgreSQL client tools installation
6. Review file permissions and paths
7. Open an issue on the Dyad repository with details

## Best Practices

### Before Promotion

1. **Test Thoroughly**: Ensure your local environment works perfectly
2. **Backup Data**: Create backups of any important data
3. **Plan Downtime**: Consider if any downtime is needed
4. **Review Schema**: Check for any development-only elements
5. **Security Review**: Ensure no sensitive data in schema
6. **Function Testing**: Verify all functions work as expected

### During Promotion

1. **Follow the Process**: Complete each step before moving to the next
2. **Validate Each Step**: Confirm each step completed successfully
3. **Keep Logs**: Save any error messages for troubleshooting
4. **Don't Rush**: Take time to review configurations
5. **Test Connections**: Verify database connections work

### After Promotion

1. **Test Application**: Thoroughly test your app with production database
2. **Monitor Performance**: Watch for any performance issues
3. **Set up Backups**: Configure regular database backups
4. **Configure Monitoring**: Set up logging and alerting
5. **Document Changes**: Keep record of promotion for team reference
6. **Security Policies**: Review and configure RLS policies
7. **Access Controls**: Verify proper authentication and authorization

### Environment Management

1. **Separate Configs**: Keep development and production configs separate
2. **Secret Management**: Use proper secret management for sensitive values
3. **Version Control**: Don't commit production secrets to version control
4. **Environment Variables**: Use environment-specific variables
5. **Configuration Validation**: Validate configurations in each environment

## Security Considerations

### Critical Security Steps

1. **Service Role Key Protection**
   - Never expose service role key in client-side code
   - Store securely in server-side environment variables only
   - Rotate keys periodically

2. **Row Level Security (RLS)**
   - Enable RLS on all tables with sensitive data
   - Configure appropriate policies for your use case
   - Test policies thoroughly

3. **API Key Management**
   - Use anon key for client-side operations only
   - Implement proper authentication before database operations
   - Monitor API usage for suspicious activity

4. **Database Security**
   - Use strong database passwords
   - Enable SSL connections
   - Configure network restrictions if needed
   - Regular security updates

5. **Access Control**
   - Implement proper user authentication
   - Use role-based access control
   - Regular access reviews

### Security Checklist

- [ ] Service role key stored securely
- [ ] RLS enabled on sensitive tables
- [ ] Authentication configured properly
- [ ] Strong database password set
- [ ] SSL connections enabled
- [ ] Network restrictions configured (if needed)
- [ ] API usage monitoring set up
- [ ] Backup encryption enabled
- [ ] Access controls reviewed
- [ ] Security policies documented

## Environment Variables Reference

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
POSTGRES_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Client-side Configuration (for frontend apps)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables

```bash
# Custom configurations
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_REGION=us-east-1

# Development vs Production flags
NODE_ENV=production
ENVIRONMENT=production
```

## Examples

### Example 1: New Project Creation

```bash
npm run supabase:promote

# Follow prompts:
# - Create new project: Yes
# - Project name: my-app-production
# - Organization: my-org
# - Region: us-east-1
# - Database password: [strong-password]
```

### Example 2: Using Existing Project

```bash
npm run supabase:promote

# Follow prompts:
# - Use existing project: Yes
# - Project reference: abcdefgh
# - Supabase URL: https://abcdefgh.supabase.co
# - Anon key: [key]
# - Service role key: [key]
```

### Example 3: Manual Schema Application

```sql
-- Example of manual schema application in Supabase SQL editor

-- Create tables
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

## Support and Resources

### Documentation Links

- [Supabase Official Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community Resources

- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Dyad GitHub Issues](https://github.com/rkendel1/Dyad/issues)

### Getting Help

1. Check this documentation first
2. Search existing issues in the Dyad repository
3. Create a new issue with detailed information:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Expected vs actual behavior

---

This production promotion feature is designed to make the transition from local development to production as smooth as possible while maintaining security and reliability. Always test thoroughly and follow security best practices when deploying to production.
