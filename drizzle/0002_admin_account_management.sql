CREATE TABLE IF NOT EXISTS "admin_accounts" (
	"seller_id" uuid PRIMARY KEY NOT NULL REFERENCES "sellers"("id") ON DELETE CASCADE,
	"organization_name" varchar(160),
	"id_number_encrypted" text,
	"can_manage_admins" boolean DEFAULT false NOT NULL,
	"created_by" uuid REFERENCES "sellers"("id") ON DELETE SET NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "admin_invites" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"organization_name" varchar(160),
	"id_number_encrypted" text,
	"can_manage_admins" boolean DEFAULT false NOT NULL,
	"invited_by" uuid NOT NULL REFERENCES "sellers"("id"),
	"replaces_seller_id" uuid REFERENCES "sellers"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_invites_replaces_seller_id_idx" ON "admin_invites" ("replaces_seller_id");

CREATE TABLE IF NOT EXISTS "admin_phone_changes" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"seller_id" uuid NOT NULL REFERENCES "sellers"("id") ON DELETE CASCADE,
	"code_hash" varchar(64) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "admin_bootstrap_revocations" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"revoked_at" timestamp DEFAULT now() NOT NULL
);
