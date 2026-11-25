# Appointify - Next.js

A full-stack web application that allows users to discover local businesses, browse their services, and book appointments online, while providing business owners with tools to manage their profiles, services, working hours, reservations, and customer reviews.

## Category seeding

To create or update only the categories:

```bash
npm run seed:categories
```

The shared definitions in `prisma/categories.ts` use English names. Existing Serbian
names are renamed in place, preserving category IDs and business relationships.
Running this command again does not create duplicates. The old names in `previousName`
are kept only to recognize and update older databases.

The full `prisma/seed.ts` also uses these definitions and English category lookups.
It additionally creates or updates demo users, businesses, services and reviews,
so use the category-only command when updating categories in an existing database.

## Local email reminders

The registration email is a welcome message, not email verification.
Email appointment dates and times use `Europe/Belgrade`, including daylight-saving changes.

Set `GMAIL_USER`, `GMAIL_APP_PASSWORD` and a private random `CRON_SECRET` in `.env`.
Never prefix the secret with `NEXT_PUBLIC_` or commit it. To generate a secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

To start both the development server and automatic email reminders:

```bash
npm run dev:reminders
```

Stop any existing development server first. The command uses port 3000 (or `PORT` from the environment),
checks reminders immediately and then every five minutes, and stops both processes with Ctrl+C.
These checks send real emails to eligible reservation clients.
The computer must remain awake, with the application, database and internet connection available.
Nothing runs while the computer is off. This does not install a Windows scheduled task or require hosting.

Alternatively, keep `npm run dev` running and use `npm run reminders` in a second terminal.
Do not run both reminder commands at the same time.

- Appointment reminders cover unsent confirmed appointments starting within the next 24 hours.
  When restarted, the job can catch up until the appointment starts.
- Review reminders cover completed appointments that ended between 24 hours and seven days ago,
  provided no review exists. Older appointments are not emailed when the app restarts.
- Successful sends are recorded in the database. Failed sends are retried while still eligible.
- Email delivery and the database update are separate operations; an interruption between them can cause a duplicate.
- `/api/reminders` requires `Authorization: Bearer <CRON_SECRET>`. Opening it in a browser returns 401.
  Missing server configuration returns 503. Concurrent jobs in the same server process return 409.

The current overlap guard supports a single local server process, not a distributed deployment.

