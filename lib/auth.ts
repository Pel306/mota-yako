import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  adminSessions,
  adminUsers,
  sellerSessions,
  sellers,
} from "@/src/db/schema";

const sessionCookieName = "mota_seller_session";
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 30;
const adminSessionCookieName = "mota_admin_session";
const adminSessionLifetimeMs = 1000 * 60 * 60 * 12;

export type SellerSession = {
  id: string;
  name: string;
  phone: string;
  type: "private" | "dealer";
  dealerName: string | null;
};

export type AdminSession = {
  id: string;
  name: string;
  phone: string;
  organizationName: string | null;
  idNumberEncrypted: string | null;
  canManageAdmins: boolean;
  mustChangePassword: boolean;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSellerSession(sellerId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await db.insert(sellerSessions).values({
    sellerId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSellerSession(): Promise<SellerSession | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  const [session] = await db
    .select({
      id: sellers.id,
      name: sellers.name,
      phone: sellers.phone,
      type: sellers.type,
      dealerName: sellers.dealerName,
    })
    .from(sellerSessions)
    .innerJoin(sellers, eq(sellerSessions.sellerId, sellers.id))
    .where(and(eq(sellerSessions.tokenHash, hashToken(token)), gt(sellerSessions.expiresAt, new Date())))
    .limit(1);

  if (!session || (session.type !== "private" && session.type !== "dealer")) return null;
  return { ...session, type: session.type };
}

function configuredPhones(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => normalizeZimbabwePhone(value.trim()))
    .filter((value): value is string => value !== null);
}

export function getConfiguredAdminPhones() {
  return configuredPhones("ADMIN_PHONES");
}

export function getConfiguredAdminManagerPhones() {
  const managers = configuredPhones("ADMIN_MANAGER_PHONES");
  return managers.length ? managers : getConfiguredAdminPhones();
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(adminSessionCookieName)?.value;
  if (!token) return null;

  const [account] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      phone: adminUsers.phone,
      organizationName: adminUsers.organizationName,
      idNumberEncrypted: adminUsers.idNumberEncrypted,
      canManageAdmins: adminUsers.canManageAdmins,
      mustChangePassword: adminUsers.mustChangePassword,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return account ?? null;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + adminSessionLifetimeMs);
  await db.insert(adminSessions).values({
    adminId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  (await cookies()).set(adminSessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(adminSessionCookieName);
}

export async function isAdminPhone(phone: string) {
  const [account] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.phone, phone))
    .limit(1);
  return Boolean(account);
}

export async function isAdminManagerPhone(phone: string) {
  const [account] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.phone, phone), eq(adminUsers.canManageAdmins, true)))
    .limit(1);
  return Boolean(account);
}

export function normalizeZimbabwePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const international = digits.startsWith("0")
    ? `263${digits.slice(1)}`
    : digits.startsWith("263")
      ? digits
      : "";
  if (international.length < 11 || international.length > 15) return null;
  return `+${international}`;
}

export async function clearSellerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    await db.delete(sellerSessions).where(eq(sellerSessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(sessionCookieName);
}
