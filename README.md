# Mota Yako

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, and `AUTH_CODE_SECRET`. Keep `.env.local` out of source control.
2. Start PostgreSQL and MinIO. With Docker Desktop running, start the object store and create its public-read vehicle-photo bucket:

   ```powershell
   npm run storage:up
   ```

   The command starts MinIO, creates the configured bucket if needed, and applies a read-only public policy so buyers can load listing photos. Compose reads credentials from `.env.local`; the MinIO root user/password are the same as the application storage access key/secret. Only vehicle photos are stored in the public bucket. Never put identity documents in this bucket.
3. Apply the database migrations:

   ```powershell
   npm run db:migrate
   ```

4. Start the website:

   ```powershell
   npm run dev
   ```

   The local site uses `http://localhost:4000` when `PORT=4000` is set.

## Seller and buyer flows

- Sellers create private or dealer profiles and verify their Zimbabwe mobile number with a one-time code.
- In development, `SMS_PROVIDER=console` displays verification codes in the relevant sign-in or password screen. This mode is disabled in production.
- To send real messages, set `SMS_PROVIDER=twilio` and provide `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` in the deployment environment.
- Sellers upload vehicle photos to MinIO, submit listings for review, and manage their listings and buyer enquiries from `/seller`. The database stores each MinIO image URL with the listing.
- Admins sign in at `/admin/sign-in` with Supabase Auth email and password. Admin authorization remains in `admin_users`; the app links a verified Supabase Auth user to an admin record by email on first sign-in and stores the Supabase user ID for later checks.
- Bootstrap managers must be listed in both `ADMIN_PHONES` and `ADMIN_MANAGER_PHONES`. After `npm run db:migrate`, create their Supabase Auth users and set their matching email on the bootstrap rows in `admin_users`. New admins must have an email; managers create the admin record and send a Supabase invitation to set a password. Password reset and password changes use Supabase Auth. Managers can update profiles, revoke access, and request verified phone changes. Set a private 32-byte hexadecimal `ADMIN_ID_ENCRYPTION_KEY` to encrypt optional admin ID numbers at rest; do not use this field as a substitute for KYC.

For Supabase Auth, set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Enable email/password sign-in and email confirmations, configure SMTP, set the project Site URL to `NEXT_PUBLIC_SITE_URL`, and allowlist `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=**` for invitations and password resets. Ensure the invite and recovery email templates use the redirect URL supplied by Auth (for example, `{{ .RedirectTo }}`) rather than hard-coding the Site URL. Set `SUPABASE_SERVICE_ROLE_KEY` only in server-side environment configuration; it is required to send admin invitations and must never be exposed to the browser. Existing admins need a Supabase Auth user with a verified email matching `admin_users.email`. After a successful first sign-in, the app stores the Auth user ID against that admin record.
- Buyers can submit enquiries without an account. Their contact details are visible only to the seller who owns the listing.
- Existing design-guide sample cars remain visible and are not real listings.

The database stores seller profiles, sessions, pending/published listings, buyer enquiries, and listing review history. Listing plan prices remain informational; no payment provider or identity/business KYC provider is configured.

## Production setup

Set every secret in the hosting provider's environment configuration rather than committing `.env.local`. Use a reachable PostgreSQL database and S3-compatible object store; set `STORAGE_PUBLIC_URL` to the public base URL for the vehicle-photo bucket. Configure Supabase Auth's email/password provider, email confirmations, and SMTP; set the project Site URL to `NEXT_PUBLIC_SITE_URL`, and allowlist `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=**` as a redirect URL. Ensure invite and recovery email templates honor the supplied redirect URL. Provide `SUPABASE_SERVICE_ROLE_KEY` only as a server-side secret; it is used to invite admins and must never be exposed to the browser. Bootstrap managers need a verified Supabase Auth account whose email matches their `admin_users.email`. Also set `SMS_PROVIDER=twilio`, Twilio credentials, `ADMIN_PHONES`, `ADMIN_MANAGER_PHONES`, a strong random `AUTH_CODE_SECRET`, and a private 32-byte hexadecimal `ADMIN_ID_ENCRYPTION_KEY` for seller and phone-change verification. Keep the admin ID encryption key stable and backed up; losing it makes stored ID numbers unreadable. Apply migrations as part of deployment before starting application instances.
