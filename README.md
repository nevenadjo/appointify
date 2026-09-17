# Appointify

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

For future hosting, schedule an authenticated GET request to this route every five minutes.
The current overlap guard supports a single local server process, not a distributed deployment.

## Development

This project uses Next.js.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
