-- Add cached fields for external API data
ALTER TABLE `apps` ADD `supabase_project_name` text;
ALTER TABLE `apps` ADD `vercel_team_slug` text;
