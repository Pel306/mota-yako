import { pgTable, text, integer, numeric, timestamp, varchar, uuid, index, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const sellers = pgTable(
  "sellers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    type: varchar("type", { length: 20 }).notNull(),
    dealerName: varchar("dealer_name", { length: 160 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("sellers_type_idx").on(table.type)]
);

export const authChallenges = pgTable("auth_challenges", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  sellerType: varchar("seller_type", { length: 20 }).notNull(),
  dealerName: varchar("dealer_name", { length: 160 }),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const sellerSessions = pgTable(
  "seller_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("seller_sessions_seller_id_idx").on(table.sellerId)]
);

export const adminAccounts = pgTable("admin_accounts", {
  sellerId: uuid("seller_id").primaryKey().references(() => sellers.id, { onDelete: "cascade" }),
  organizationName: varchar("organization_name", { length: 160 }),
  idNumberEncrypted: text("id_number_encrypted"),
  canManageAdmins: boolean("can_manage_admins").default(false).notNull(),
  createdBy: uuid("created_by").references(() => sellers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminInvites = pgTable(
  "admin_invites",
  {
    phone: varchar("phone", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    organizationName: varchar("organization_name", { length: 160 }),
    idNumberEncrypted: text("id_number_encrypted"),
    canManageAdmins: boolean("can_manage_admins").default(false).notNull(),
    invitedBy: uuid("invited_by").notNull().references(() => sellers.id),
    replacesSellerId: uuid("replaces_seller_id").references(() => sellers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("admin_invites_replaces_seller_id_idx").on(table.replacesSellerId)]
);

export const adminBootstrapRevocations = pgTable("admin_bootstrap_revocations", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  revokedAt: timestamp("revoked_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  passwordHash: text("password_hash"),
  organizationName: varchar("organization_name", { length: 160 }),
  idNumberEncrypted: text("id_number_encrypted"),
  canManageAdmins: boolean("can_manage_admins").default(false).notNull(),
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("admin_sessions_admin_id_idx").on(table.adminId)]
);

export const adminAuthChallenges = pgTable("admin_auth_challenges", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  purpose: varchar("purpose", { length: 24 }).default("password_setup").notNull(),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const adminPhoneChanges = pgTable("admin_phone_changes", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  adminId: uuid("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  mileage: integer("mileage").notNull(),
  transmission: varchar("transmission", { length: 50 }).notNull(), // Automatic / Manual
  fuelType: varchar("fuel_type", { length: 50 }).notNull(), // Petrol, Diesel, Hybrid, Electric
  bodyType: varchar("body_type", { length: 50 }).notNull(), // SUV, Sedan, Hatchback, Truck
  color: varchar("color", { length: 50 }),
  description: text("description"),
  images: text("images").array().notNull(), // Array of image URLs
  sellerPhone: varchar("seller_phone", { length: 50 }).notNull(),
  sellerId: uuid("seller_id").references(() => sellers.id, { onDelete: "set null" }),
  location: varchar("location", { length: 80 }).notNull().default("Harare"),
  vin: varchar("vin", { length: 40 }),
  duty: varchar("duty", { length: 20 }).notNull().default("unpaid"),
  documents: text("documents").array().notNull().default(sql`ARRAY[]::text[]`),
  plan: varchar("plan", { length: 20 }).notNull().default("basic"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, available, rejected, sold
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("cars_status_created_at_idx").on(table.status, table.createdAt),
  index("cars_seller_id_idx").on(table.sellerId),
]);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    buyerName: varchar("buyer_name", { length: 120 }).notNull(),
    buyerEmail: varchar("buyer_email", { length: 254 }),
    buyerPhone: varchar("buyer_phone", { length: 20 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("enquiries_car_id_created_at_idx").on(table.carId, table.createdAt),
    index("enquiries_buyer_phone_idx").on(table.buyerPhone),
  ]
);

export const listingReviews = pgTable(
  "listing_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
    adminUserId: uuid("admin_user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("listing_reviews_car_id_created_at_idx").on(table.carId, table.createdAt)]
);