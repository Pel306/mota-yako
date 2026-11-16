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
- Admins sign in separately from sellers and dealers at `/admin/sign-in` with a password. Add comma-separated bootstrap admin numbers to `ADMIN_PHONES`; after `npm run db:migrate`, each passwordless admin can request an SMS code and set an initial password. Do not rely on phone verification as identity or business KYC.
- Bootstrap managers must be listed in both `ADMIN_PHONES` and `ADMIN_MANAGER_PHONES`. They can create up to five total admin accounts; each new admin sets their own password after verifying their phone by SMS on first sign-in. Subsequent password changes require the current password and a fresh SMS code. Managers can update profiles, revoke access, and request verified phone changes. Set a private 32-byte hexadecimal `ADMIN_ID_ENCRYPTION_KEY` to encrypt optional admin ID numbers at rest; do not use this field as a substitute for KYC.
- Buyers can submit enquiries without an account. Their contact details are visible only to the seller who owns the listing.
- Existing design-guide sample cars remain visible and are not real listings.

The database stores seller profiles, sessions, pending/published listings, buyer enquiries, and listing review history. Listing plan prices remain informational; no payment provider or identity/business KYC provider is configured.

## Production setup

Set every secret in the hosting provider's environment configuration rather than committing `.env.local`. Use a reachable PostgreSQL database and S3-compatible object store; set `STORAGE_PUBLIC_URL` to the public base URL for the vehicle-photo bucket. Set `SMS_PROVIDER=twilio`, Twilio credentials, `ADMIN_PHONES`, `ADMIN_MANAGER_PHONES`, a strong random `AUTH_CODE_SECRET`, and a private 32-byte hexadecimal `ADMIN_ID_ENCRYPTION_KEY`. Keep the admin ID encryption key stable and backed up; losing it makes stored ID numbers unreadable. Apply migrations as part of deployment before starting application instances.
