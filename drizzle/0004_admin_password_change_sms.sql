ALTER TABLE "admin_auth_challenges"
ADD COLUMN IF NOT EXISTS "purpose" varchar(24) NOT NULL DEFAULT 'password_setup';
