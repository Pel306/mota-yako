ALTER TABLE "admin_users"
  ADD COLUMN IF NOT EXISTS "auth_user_id" uuid;

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_auth_user_id_unique"
  ON "admin_users" ("auth_user_id");
