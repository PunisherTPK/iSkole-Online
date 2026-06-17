# iSkole Online

Structure-first educational content management MVP for [iskole.online](https://iskole.online).

The application is database-driven. Curriculums, levels, subjects, resource types, resources, past papers, teachers, and assignments come from Supabase records rather than hardcoded education systems or subject names.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel-ready deployment

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app uses sample fallback data until Supabase variables are configured.

## Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://iskole.online
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=use-a-strong-password
ADMIN_ROLE=super_admin
ADMIN_TEACHER_EMAIL=
```

Set `ADMIN_ROLE=teacher` and `ADMIN_TEACHER_EMAIL=teacher@example.com` to preview the teacher-limited admin experience.

## Database

Run the migration first:

```sql
supabase/migrations/202606170001_structure_first_cms.sql
```

For a fresh project, you can also run:

```sql
supabase/schema.sql
supabase/seed.sql
```

Core tables:

- `curriculums`
- `levels`
- `subjects`
- `resource_types`
- `resources`
- `past_papers`
- `teachers`
- `teacher_assignments`

Soft delete is implemented with `deleted_at`. Public reads are protected by RLS policies that only expose active content.

## Public Routes

- `/` curriculum selector
- `/{curriculumSlug}` levels
- `/{curriculumSlug}/{levelSlug}` subjects
- `/{curriculumSlug}/{levelSlug}/{subjectSlug}` resources
- `/{curriculumSlug}/{levelSlug}/{subjectSlug}/past-papers`
- `/search`
- `/sitemap.xml`
- `/robots.txt`

## Admin Routes

- `/admin` dashboard
- `/admin/curriculums`
- `/admin/levels`
- `/admin/subjects`
- `/admin/resources`
- `/admin/past-papers`
- `/admin/teachers`
- `/admin/settings`

The admin UI uses cards, filters, breadcrumbs, soft deletes, confirmation dialogs, loading states, and simple pagination.

## Folder Structure

```text
src/app
  [curriculumSlug]/
    [levelSlug]/
      [subjectSlug]/
        past-papers/
  admin/
    curriculums/
    levels/
    subjects/
    resources/
    past-papers/
    teachers/
    settings/
src/components
  admin/
src/lib
supabase/
  migrations/
```

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add all environment variables.
4. Run the Supabase migration and seed data.
5. Deploy.
6. Point `iskole.online` DNS to Vercel.
