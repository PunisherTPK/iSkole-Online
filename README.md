# iSkole Online

Production-ready MVP for [iskole.online](https://iskole.online), a Sri Lankan past paper and question bank website.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase
- SEO routes for metadata, sitemap, and robots.txt

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app runs with bundled sample data until Supabase variables are added.

## Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=https://iskole.online
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=use-a-strong-password
```

`SUPABASE_SERVICE_ROLE_KEY` is only used in server actions for `/admin`. Never expose it in client code.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Add the environment variables to `.env.local` and Vercel.

Public read access is enabled through RLS policies. Admin writes use the service role key from the server.

## Routes

- `/` homepage with global search and grade cards
- `/grade-10` grade page
- `/grade-10/science` subject page
- `/grade-10/science/electricity` lesson page
- `/grade-10/science/electricity/2024-past-paper` paper page
- `/search?q=electricity` search results
- `/admin` password-protected content manager
- `/sitemap.xml`
- `/robots.txt`

## Admin

Set `ADMIN_PASSWORD` before using `/admin`.

The admin can add grades, subjects, lessons, papers, and questions. Existing questions can be edited or deleted.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Set the environment variables listed above.
4. Deploy.
5. Point `iskole.online` DNS to Vercel.

Recommended production values:

- `NEXT_PUBLIC_SITE_URL=https://iskole.online`
- Strong unique `ADMIN_PASSWORD`
- Supabase service role key stored only as a Vercel server environment variable

## Architecture Notes

- `src/lib/data.ts` owns all content reads and URL construction.
- `src/lib/admin-actions.ts` owns protected content writes.
- `src/components` contains reusable UI.
- Future features such as accounts, discussions, AI explanations, exam generation, and subscriptions can be added without changing the public route structure.
