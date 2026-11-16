CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL UNIQUE,
	"password_hash" text,
	"organization_name" varchar(160),
	"id_number_encrypted" text,
	"can_manage_admins" boolean DEFAULT false NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
	"token_hash" varchar(64) NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_sessions_admin_id_idx" ON "admin_sessions" ("admin_id");

CREATE TABLE IF NOT EXISTS "admin_auth_challenges" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "admin_phone_changes" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
	"code_hash" varchar(64) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);

INSERT INTO "admin_users" (
	"name",
	"phone",
	"organization_name",
	"id_number_encrypted",
	"can_manage_admins",
	"created_at"
)
SELECT
	sellers."name",
	sellers."phone",
	admin_accounts."organization_name",
	admin_accounts."id_number_encrypted",
	admin_accounts."can_manage_admins",
	admin_accounts."created_at"
FROM "admin_accounts"
INNER JOIN "sellers" ON "sellers"."id" = "admin_accounts"."seller_id"
ON CONFLICT ("phone") DO NOTHING;

ALTER TABLE "listing_reviews" ALTER COLUMN "admin_seller_id" DROP NOT NULL;
ALTER TABLE "listing_reviews" ADD COLUMN IF NOT EXISTS "admin_user_id" uuid REFERENCES "admin_users"("id") ON DELETE SET NULL;
