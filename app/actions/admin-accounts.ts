"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getAdminSession,
  getConfiguredAdminPhones,
  normalizeZimbabwePhone,
} from "@/lib/auth";
import { encryptAdminIdNumber } from "@/lib/admin-id";
import { hashVerificationCode } from "@/lib/auth-code";
import { db } from "@/lib/db";
import { sendVerificationCode } from "@/lib/sms";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { authCallbackUrl } from "@/lib/supabase/redirect-url";
import { adminBootstrapRevocations, adminPhoneChanges, adminUsers } from "@/src/db/schema";

const adminLimit = 5;

async function requireAdminManager() {
  const session = await getAdminSession();
  if (!session?.canManageAdmins) {
    throw new Error("Only an authorized admin manager can manage admin accounts.");
  }
  return session;
}

async function findOrInviteSupabaseUser(email: string) {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const existingUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (existingUser) {
      if (!existingUser.email_confirmed_at) {
        throw new Error("This email already has an unconfirmed Supabase Auth account.");
      }
      return { userId: existingUser.id, invited: false, supabase };
    }
    if (data.users.length < perPage) break;
  }

  const { data: invitation, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: authCallbackUrl("/admin/change-password"),
  });
  if (inviteError) throw inviteError;
  if (!invitation.user) throw new Error("Supabase did not return the invited user.");

  return { userId: invitation.user.id, invited: true, supabase };
}

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function encryptOptionalId(value: string) {
  return value ? encryptAdminIdNumber(value) : null;
}

export async function createAdminAccount(formData: FormData) {
  await requireAdminManager();
  const name = readText(formData, "name");
  const phone = normalizeZimbabwePhone(readText(formData, "phone"));
  const email = readText(formData, "email").toLowerCase();
  const organizationName = readText(formData, "organizationName");
  const idNumber = readText(formData, "idNumber");

  if (name.length < 2 || name.length > 120 || !phone || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || organizationName.length > 160 || idNumber.length > 100) {
    return { ok: false, error: "Enter a valid name, Zimbabwe mobile number, admin email, organization, and optional ID number." };
  }

  let createdAdminId: string | undefined;
  let invitedAuthUserId: string | undefined;
  let supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;
  try {
    const [existing] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (existing) return { ok: false, error: "That phone number already belongs to an admin account." };
    const [existingEmail] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(sql`lower(${adminUsers.email})`, email)).limit(1);
    if (existingEmail) return { ok: false, error: "That email already belongs to an admin account." };
    const [count] = await db.select({ value: sql<number>`count(*)::int` }).from(adminUsers);
    if (Number(count.value) >= adminLimit) {
      return { ok: false, error: `The limit of ${adminLimit} admin accounts has been reached.` };
    }

    const [created] = await db.insert(adminUsers).values({
      name,
      phone,
      email,
      organizationName: organizationName || null,
      idNumberEncrypted: encryptOptionalId(idNumber),
      canManageAdmins: false,
    }).returning({ id: adminUsers.id });
    if (!created) throw new Error("The admin account could not be saved.");
    createdAdminId = created.id;

    const authUser = await findOrInviteSupabaseUser(email);
    supabaseAdmin = authUser.supabase;
    invitedAuthUserId = authUser.invited ? authUser.userId : undefined;
    const [linked] = await db.update(adminUsers)
      .set({ authUserId: authUser.userId, mustChangePassword: authUser.invited })
      .where(and(eq(adminUsers.id, created.id), isNull(adminUsers.authUserId)))
      .returning({ id: adminUsers.id });
    if (!linked) throw new Error("The new admin account could not be linked to Supabase Auth.");

    revalidatePath("/admin");
    return { ok: true, invited: authUser.invited };
  } catch (error) {
    console.error("Could not create admin account", error);
    if (createdAdminId) {
      try {
        await db.delete(adminUsers).where(eq(adminUsers.id, createdAdminId));
      } catch (cleanupError) {
        console.error("Could not roll back an incomplete admin account", cleanupError);
      }
    }
    if (invitedAuthUserId && supabaseAdmin) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(invitedAuthUserId);
      if (deleteError) console.error("Could not remove an orphaned Supabase invitation", deleteError);
    }
    const message = error instanceof Error ? error.message : "";
    return {
      ok: false,
      error: message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("unconfirmed Supabase Auth account")
        ? message
        : "Could not create the admin account. Please try again.",
    };
  }
}

export async function inviteAdminAccount(input: { adminId: string }) {
  await requireAdminManager();
  const adminId = typeof input?.adminId === "string" ? input.adminId : "";
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(adminId)) {
    return { ok: false, error: "The admin account selected for invitation is invalid." };
  }

  try {
    const [account] = await db.select({
      id: adminUsers.id,
      email: adminUsers.email,
      authUserId: adminUsers.authUserId,
    }).from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
    if (!account) return { ok: false, error: "Admin account not found." };
    if (!account.email) return { ok: false, error: "Add an admin sign-in email before sending an invitation." };
    if (account.authUserId) return { ok: true, invited: false };

    const authUser = await findOrInviteSupabaseUser(account.email.toLowerCase());
    const [linked] = await db.update(adminUsers)
      .set({
        authUserId: authUser.userId,
        ...(authUser.invited ? { mustChangePassword: true } : {}),
      })
      .where(and(eq(adminUsers.id, account.id), isNull(adminUsers.authUserId)))
      .returning({ id: adminUsers.id });
    if (!linked) {
      const [current] = await db.select({ authUserId: adminUsers.authUserId })
        .from(adminUsers).where(eq(adminUsers.id, account.id)).limit(1);
      if (current?.authUserId !== authUser.userId) {
        throw new Error("The admin account was linked to a different Supabase user.");
      }
    }

    revalidatePath("/admin");
    return { ok: true, invited: authUser.invited };
  } catch (error) {
    console.error("Could not invite admin account", error);
    const message = error instanceof Error ? error.message : "";
    return {
      ok: false,
      error: message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("unconfirmed Supabase Auth account")
        ? message
        : "Could not send or link the Supabase invitation. Please try again.",
    };
  }
}

export async function updateAdminDetails(formData: FormData) {
  const manager = await requireAdminManager();
  const adminId = readText(formData, "adminId");
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLowerCase();
  const organizationName = readText(formData, "organizationName");
  const idNumber = readText(formData, "idNumber");
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(adminId) ||
      name.length < 2 || name.length > 120 || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || organizationName.length > 160 || idNumber.length > 100) {
    throw new Error("Enter valid admin profile details.");
  }

  const [account] = await db.select({
    id: adminUsers.id,
    email: adminUsers.email,
    authUserId: adminUsers.authUserId,
  })
    .from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
  if (!account) throw new Error("Admin account not found.");

  const [emailOwner] = await db.select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(
      eq(sql`lower(${adminUsers.email})`, email),
      ne(adminUsers.id, adminId),
    ))
    .limit(1);
  if (emailOwner) throw new Error("That email already belongs to another admin account.");

  if (account.authUserId && account.email?.toLowerCase() !== email) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(account.authUserId, { email });
    if (error) {
      console.error("Could not update the admin Supabase Auth email", error);
      throw new Error("Could not update the admin sign-in email.");
    }
  }

  await db.update(adminUsers).set({
    name,
    email,
    organizationName: organizationName || null,
    idNumberEncrypted: encryptOptionalId(idNumber),
  }).where(eq(adminUsers.id, adminId));
  if (manager.id === adminId) revalidatePath("/admin");
  revalidatePath("/admin");
}

export async function requestAdminPhoneChange(input: { adminId: string; phone: string }) {
  await requireAdminManager();
  const adminId = typeof input?.adminId === "string" ? input.adminId : "";
  const phone = normalizeZimbabwePhone(typeof input?.phone === "string" ? input.phone : "");
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(adminId) || !phone) {
    return { ok: false, error: "Enter a valid Zimbabwe mobile number." };
  }
  const [account] = await db.select({ phone: adminUsers.phone })
    .from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
  if (!account) return { ok: false, error: "Admin account not found." };
  if (account.phone === phone) return { ok: false, error: "That is already this admin's phone number." };
  const [existing] = await db.select({ id: adminUsers.id })
    .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
  if (existing) return { ok: false, error: "That phone number is already assigned to an admin." };

  const [previous] = await db.select({ createdAt: adminPhoneChanges.createdAt })
    .from(adminPhoneChanges).where(eq(adminPhoneChanges.phone, phone)).limit(1);
  if (previous && Date.now() - previous.createdAt.getTime() < 60_000) {
    return { ok: false, error: "Wait one minute before requesting another verification code." };
  }

  const code = randomInt(100000, 1000000).toString();
  const now = new Date();
  await db.insert(adminPhoneChanges).values({
    phone,
    adminId,
    codeHash: hashVerificationCode(phone, code),
    attempts: 0,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 10 * 60_000),
  }).onConflictDoUpdate({
    target: adminPhoneChanges.phone,
    set: {
      adminId,
      codeHash: hashVerificationCode(phone, code),
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
    },
  });
  try {
    await sendVerificationCode(phone, code, "admin phone change");
  } catch (error) {
    await db.delete(adminPhoneChanges).where(eq(adminPhoneChanges.phone, phone));
    console.error("Could not send admin phone change code", error);
    return { ok: false, error: "Could not send the verification code." };
  }
  return {
    ok: true,
    phone,
    devCode: process.env.NODE_ENV === "development" && (process.env.SMS_PROVIDER ?? "console") === "console"
      ? code
      : undefined,
  };
}

export async function verifyAdminPhoneChange(input: { adminId: string; phone: string; code: string }) {
  await requireAdminManager();
  const adminId = typeof input?.adminId === "string" ? input.adminId : "";
  const phone = normalizeZimbabwePhone(typeof input?.phone === "string" ? input.phone : "");
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  if (!phone || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(adminId) || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the new phone number and six-digit verification code." };
  }

  const [challenge] = await db.select().from(adminPhoneChanges)
    .where(and(eq(adminPhoneChanges.phone, phone), eq(adminPhoneChanges.adminId, adminId), gt(adminPhoneChanges.expiresAt, new Date())))
    .limit(1);
  if (!challenge || challenge.attempts >= 5) {
    return { ok: false, error: "The code expired or is no longer valid. Request a new one." };
  }
  const expected = Buffer.from(hashVerificationCode(phone, code), "hex");
  const actual = Buffer.from(challenge.codeHash, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await db.update(adminPhoneChanges)
      .set({ attempts: sql`${adminPhoneChanges.attempts} + 1` })
      .where(eq(adminPhoneChanges.phone, phone));
    return { ok: false, error: "That code is incorrect. Check it and try again." };
  }

  const [existing] = await db.select({ id: adminUsers.id })
    .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
  if (existing) return { ok: false, error: "That phone number is already assigned to an admin." };
  const [target] = await db.select({ phone: adminUsers.phone })
    .from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
  if (!target) return { ok: false, error: "Admin account not found." };

  await db.transaction(async (transaction) => {
    if (getConfiguredAdminPhones().includes(target.phone)) {
      await transaction.insert(adminBootstrapRevocations).values({ phone: target.phone }).onConflictDoNothing();
    }
    await transaction.update(adminUsers).set({ phone }).where(eq(adminUsers.id, adminId));
    await transaction.delete(adminPhoneChanges).where(eq(adminPhoneChanges.phone, phone));
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function revokeAdminAccount(formData: FormData) {
  const manager = await requireAdminManager();
  const adminId = readText(formData, "adminId");
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(adminId)) {
    throw new Error("The admin account selected for removal is invalid.");
  }
  if (adminId === manager.id) throw new Error("You cannot remove your own admin access.");

  const [account] = await db.select({
    id: adminUsers.id,
    phone: adminUsers.phone,
    canManageAdmins: adminUsers.canManageAdmins,
  })
    .from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
  if (!account) throw new Error("Admin account not found.");
  if (account.canManageAdmins) {
    const [managerCount] = await db.select({ value: sql<number>`count(*)::int` })
      .from(adminUsers).where(eq(adminUsers.canManageAdmins, true));
    if (Number(managerCount.value) <= 1) throw new Error("At least one admin manager must remain.");
  }
  await db.transaction(async (transaction) => {
    if (getConfiguredAdminPhones().includes(account.phone)) {
      await transaction.insert(adminBootstrapRevocations).values({ phone: account.phone }).onConflictDoNothing();
    }
    await transaction.delete(adminUsers).where(eq(adminUsers.id, adminId));
  });
  revalidatePath("/admin");
}
