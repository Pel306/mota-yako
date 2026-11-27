ALTER TABLE "admin_users"
  ADD COLUMN IF NOT EXISTS "email" varchar(254);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_unique"
  ON "admin_users" ("email")
  WHERE "email" IS NOT NULL;
