-- JWT functions for Supabase
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;

-- Create the auth schema and functions
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_admin;

-- Create basic roles for Supabase
DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'anon') THEN
    CREATE ROLE anon noinherit;
  END IF;
END
$do$;

DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated noinherit;
  END IF;
END
$do$;

DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role noinherit;
  END IF;
END
$do$;

DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator noinherit LOGIN PASSWORD 'your-super-secret-and-long-postgres-password';
  END IF;
END
$do$;

DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin noinherit createrole LOGIN PASSWORD 'your-super-secret-and-long-postgres-password';
  END IF;
END
$do$;

DO
$do$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles
    WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin noinherit createrole LOGIN PASSWORD 'your-super-secret-and-long-postgres-password';
  END IF;
END
$do$;

-- Grant basic permissions
GRANT anon, authenticated, service_role TO authenticator;
GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_admin;
GRANT ALL ON SCHEMA public TO supabase_admin;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Create a simple function to get the current user's JWT claims
CREATE OR REPLACE FUNCTION auth.jwt() 
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT 
    CASE 
      WHEN current_setting('request.jwt.claim', true) IS NULL THEN '{}'::jsonb
      ELSE current_setting('request.jwt.claim', true)::jsonb
    END;
$$;

-- Create function to get current user
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT 
    CASE 
      WHEN auth.jwt() ->> 'sub' IS NULL THEN NULL
      ELSE (auth.jwt() ->> 'sub')::uuid
    END;
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION auth.role() 
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', 'anon');
$$;