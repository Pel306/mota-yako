CREATE TABLE IF NOT EXISTS "sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL UNIQUE,
	"type" varchar(20) NOT NULL,
	"dealer_name" varchar(160),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sellers_type_idx" ON "sellers" ("type");

CREATE TABLE IF NOT EXISTS "auth_challenges" (
	"phone" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"seller_type" varchar(20) NOT NULL,
	"dealer_name" varchar(160),
	"code_hash" varchar(64) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "seller_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL REFERENCES "sellers"("id") ON DELETE CASCADE,
	"token_hash" varchar(64) NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "seller_sessions_seller_id_idx" ON "seller_sessions" ("seller_id");

ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "seller_id" uuid REFERENCES "sellers"("id") ON DELETE SET NULL;
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "location" varchar(80) NOT NULL DEFAULT 'Harare';
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "vin" varchar(40);
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "duty" varchar(20) NOT NULL DEFAULT 'unpaid';
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "documents" text[] NOT NULL DEFAULT ARRAY[]::text[];
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "plan" varchar(20) NOT NULL DEFAULT 'basic';
ALTER TABLE "cars" ALTER COLUMN "status" SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS "cars_status_created_at_idx" ON "cars" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "cars_seller_id_idx" ON "cars" ("seller_id");

CREATE TABLE IF NOT EXISTS "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL REFERENCES "cars"("id") ON DELETE CASCADE,
	"buyer_name" varchar(120) NOT NULL,
	"buyer_email" varchar(254),
	"buyer_phone" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "enquiries_car_id_created_at_idx" ON "enquiries" ("car_id", "created_at");
CREATE INDEX IF NOT EXISTS "enquiries_buyer_phone_idx" ON "enquiries" ("buyer_phone");

CREATE TABLE IF NOT EXISTS "listing_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL REFERENCES "cars"("id") ON DELETE CASCADE,
	"admin_seller_id" uuid NOT NULL REFERENCES "sellers"("id"),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "listing_reviews_car_id_created_at_idx" ON "listing_reviews" ("car_id", "created_at");
