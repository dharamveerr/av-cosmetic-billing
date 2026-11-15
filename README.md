# AV Cosmetics & Bangle Store - Billing

Plain HTML, CSS and JavaScript. No libraries, no installation, no internet needed.

## Run
Double-click `index.html`, or start the local server (needs Node.js, nothing to install):

    npm run dev

then open http://localhost:8080 (use `PORT=3000 npm run dev` for another port).

## Files
- `index.html` - page structure
- `styles.css` - look and layout (light and dark)
- `app.js` - all the logic (billing, items, clients, pending payments, reports, backup, English/Hindi)

## Data
Saved in the browser you use (localStorage). Each address (file or localhost) keeps its own data.
Use Backup > Copy backup every week, and Restore to move data.
