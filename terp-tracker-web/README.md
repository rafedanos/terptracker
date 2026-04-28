# Terp Tracker Web MVP

This is a static prototype of the Terp Tracker sheet as a responsive website.

## What works now
- Add detailed reviews
- Automatic overall score out of 10
- Local leaderboards: top overall, top flavor, top reviewers
- Recent reviews
- Data is stored in the browser with `localStorage`

## To make it shared for multiple people
Use Supabase:
1. Create a Supabase project.
2. Run `supabase_schema.sql` in the SQL editor.
3. Replace the localStorage functions in `app.js` with Supabase `select` and `insert` calls.
4. Deploy on Netlify or Vercel.

For a private crew, add Supabase Auth and require login before inserting reviews.


## supabase pw CX!-PuQMqB&6wgD