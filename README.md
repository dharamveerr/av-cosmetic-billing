# AV Cosmetics & Bangle Store - Billing

Plain HTML, CSS and JavaScript. No libraries. Data is stored in a Supabase (Postgres) cloud database.

## Run on your computer
Needs Node.js (nothing to install):

    npm run dev

then open http://localhost:8080 (use `PORT=3000 npm run dev` for another port) and sign in.

## Files
- `index.html` - page structure
- `styles.css` - look and layout (light and dark, phone first)
- `config.js` - Supabase project URL and the public (publishable) key
- `app.js` - all the logic (sign in, billing, items, clients, pending payments, reports, backup, English/Hindi)
- `supabase/schema.sql` - the database tables, security rules and functions (already run once in the project)
- `server.js` - tiny local web server used by `npm run dev`

## Database and security
- Tables: items, categories, clients, bills, payments. Bill numbers, stock and payments are changed only through database functions, so two phones can never create the same bill number.
- Only signed-in users can read or write. Public sign-up is switched off: add staff in Supabase > Authentication > Users > Add user.
- The publishable key in `config.js` is meant to be public. Never put the `secret` / `service_role` key or the database password in this folder.

## Backup
Backup > Copy backup exports everything as text. Restore adds a backup back into the database (existing records are skipped).
