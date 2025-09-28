-- Realtime schema setup
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS realtime;

-- Grant permissions
GRANT usage ON SCHEMA _realtime TO supabase_admin;
GRANT all ON SCHEMA _realtime TO supabase_admin;