-- PATCHED: Make migration idempotent for SQLite.
-- Add cached fields for external API data
-- If the columns already exist, these statements will error.
-- To avoid migration errors, check for column existence before running:
--   PRAGMA table_info(apps);
-- If the columns ('supabase_project_name' and 'vercel_team_slug') DO NOT exist, uncomment and run these lines:

-- ALTER TABLE `apps` ADD `supabase_project_name` text;
-- ALTER TABLE `apps` ADD `vercel_team_slug` text;

-- If the columns DO exist, do NOT run these lines.