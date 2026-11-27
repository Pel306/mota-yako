import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  adminUsers,
  sellerSessions,
  sellers,
} from "@/src/db/schema";

const sessionCookieName = "mota_seller_session";
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 30;

export type SellerSession = {
  id: string;
  name: string;
  phone: string;
  type: "private" | "dealer";
  dealerName: string | null;
};

export type AdminSession = {
  id: string;
  authUserId: string;
  email: string;
  mustChangePassword: boolean;
  name: string;
  phone: string;
  organizationName: string | null;
  idNumberEncrypted: string | null;
  canManageAdmins: boolean;
};

type AdminSessionRecord = Omit<AdminSession, "authUserId" | "email"> & {
  authUserId: string | null;
  email: string | null;
};

function createAdminSession(
  account: AdminSessionRecord,
  email: string,
  allowPasswordChange: boolean,
): AdminSession | null {
  if (!account.authUserId || (account.mustChangePassword && !allowPasswordChange)) return null;
  return {
    ...account,
    authUserId: account.authUserId,
    email: email.toLowerCase(),
  };
}

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

export async function getAdminSession(
  options: { allowPasswordChange?: boolean } = {},
): Promise<AdminSession | null> {
  const allowPasswordChange = options.allowPasswordChange === true;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email || !user.email_confirmed_at) return null;

  const accountColumns = {
    id: adminUsers.id,
    authUserId: adminUsers.authUserId,
    email: adminUsers.email,
    mustChangePassword: adminUsers.mustChangePassword,
    name: adminUsers.name,
    phone: adminUsers.phone,
    organizationName: adminUsers.organizationName,
    idNumberEncrypted: adminUsers.idNumberEncrypted,
    canManageAdmins: adminUsers.canManageAdmins,
  };
  const [linkedAccount] = await db.select(accountColumns)
    .from(adminUsers)
    .where(eq(adminUsers.authUserId, user.id))
    .limit(1);
  if (linkedAccount) {
    return createAdminSession(linkedAccount, linkedAccount.email ?? user.email, allowPasswordChange);
  }

  const [account] = await db.select(accountColumns)
    .from(adminUsers)
    .where(eq(sql`lower(${adminUsers.email})`, user.email.toLowerCase()))
    .limit(1);
  if (!account || account.authUserId) return null;

  const [linked] = await db.update(adminUsers)
    .set({ authUserId: user.id })
    .where(and(eq(adminUsers.id, account.id), isNull(adminUsers.authUserId)))
    .returning(accountColumns);
  if (linked) return createAdminSession(linked, user.email, allowPasswordChange);

  const [current] = await db.select(accountColumns)
    .from(adminUsers)
    .where(eq(adminUsers.id, account.id))
    .limit(1);
  return current?.authUserId === user.id
    ? createAdminSession(current, user.email, allowPasswordChange)
    : null;
}

export async function clearAdminSession() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
