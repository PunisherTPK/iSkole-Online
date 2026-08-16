-- iSkole Question Bank v4
--
-- The Question Bank tables already exist in the project's base Supabase schema:
--   content_nodes
--   question_pages
--   questions
--   question_answers
--   question_page_discussions
--
-- The important structural rule is that content_nodes.parent_id is recursive:
-- a node may contain another node at any depth. Question Pages may be attached
-- to a subject or to any content node.
--
-- This migration intentionally does NOT drop or recreate existing tables.
-- The existing database schema is the source of truth.

create extension if not exists "pgcrypto";

-- Keep this migration harmless when the base schema has already been applied.
-- No table changes are required for the recursive structure.
