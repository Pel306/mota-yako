CREATE TABLE IF NOT EXISTS "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"mileage" integer NOT NULL,
	"transmission" varchar(50) NOT NULL,
	"fuel_type" varchar(50) NOT NULL,
	"body_type" varchar(50) NOT NULL,
	"color" varchar(50),
	"description" text,
	"images" text[] NOT NULL,
	"seller_phone" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
