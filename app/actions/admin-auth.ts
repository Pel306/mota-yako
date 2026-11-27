"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { createAdminSession, getAdminSession, normalizeZimbabwePhone } from "@/lib/auth";
import { hashVerificationCode } from "@/lib/auth-code";
import { hashAdminPassword, verifyAdminPassword } from "@/lib/admin-password";
import { db } from "@/lib/db";
import { sendVerificationCode } from "@/lib/sms";
import { adminAuthChallenges, adminSessions, adminUsers } from "@/src/db/schema";

function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}

export async function requestAdminPasswordSetup(rawPhone: string) {
  const phone = normalizeZimbabwePhone(typeof rawPhone === "string" ? rawPhone : "");
  if (!phone) return { ok: false, error: "Enter a valid admin phone number." };

  try {
    const [admin] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (!admin) {
      return { ok: false, error: "SMS password setup is not available for this account." };
    }

    const [challenge] = await db.select({ createdAt: adminAuthChallenges.createdAt })
      .from(adminAuthChallenges).where(eq(adminAuthChallenges.phone, phone)).limit(1);
    if (challenge && Date.now() - challenge.createdAt.getTime() < 60_000) {
      return { ok: false, error: "Wait one minute before requesting another code." };
    }

    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    await db.insert(adminAuthChallenges).values({
      phone,
      purpose: "password_setup",
      codeHash: hashVerificationCode(phone, code),
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
    }).onConflictDoUpdate({
      target: adminAuthChallenges.phone,
      set: {
        purpose: "password_setup",
        codeHash: hashVerificationCode(phone, code),
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      },
    });

    try {
      await sendVerificationCode(phone, code, "admin password reset");
    } catch (error) {
      await db.delete(adminAuthChallenges).where(eq(adminAuthChallenges.phone, phone));
      console.error("Could not send admin password reset code", error);
      return { ok: false, error: "Could not send the SMS code. Check SMS configuration." };
    }
    return {
      ok: true,
      phone,
      devCode: process.env.NODE_ENV === "development" && (process.env.SMS_PROVIDER ?? "console") === "console"
        ? code
        : undefined,
    };
  } catch (error) {
    console.error("Could not start admin password reset", error);
    return { ok: false, error: "Could not start the SMS password reset. Please try again." };
  }
}

export async function requestAdminPasswordChangeCode(input: { currentPassword: string }) {
  const session = await getAdminSession();
  const currentPassword = typeof input?.currentPassword === "string" ? input.currentPassword : "";
  if (!session) return { ok: false, error: "Sign in to your admin account first." };
  if (!currentPassword || currentPassword.length > 128) {
    return { ok: false, error: "Enter your current password before requesting a code." };
  }

  try {
    const [admin] = await db.select({ passwordHash: adminUsers.passwordHash })
      .from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
    if (!admin?.passwordHash || !verifyAdminPassword(currentPassword, admin.passwordHash)) {
      return { ok: false, error: "Current password is incorrect." };
    }
    const [previousChallenge] = await db.select({ createdAt: adminAuthChallenges.createdAt })
      .from(adminAuthChallenges).where(eq(adminAuthChallenges.phone, session.phone)).limit(1);
    if (previousChallenge && Date.now() - previousChallenge.createdAt.getTime() < 60_000) {
      return { ok: false, error: "Wait one minute before requesting another code." };
    }

    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    await db.insert(adminAuthChallenges).values({
      phone: session.phone,
      purpose: "password_change",
      codeHash: hashVerificationCode(session.phone, code),
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
    }).onConflictDoUpdate({
      target: adminAuthChallenges.phone,
      set: {
        purpose: "password_change",
        codeHash: hashVerificationCode(session.phone, code),
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      },
    });

    try {
      await sendVerificationCode(session.phone, code, "admin password change");
    } catch (error) {
      await db.delete(adminAuthChallenges).where(and(
        eq(adminAuthChallenges.phone, session.phone),
        eq(adminAuthChallenges.purpose, "password_change"),
      ));
      console.error("Could not send admin password change code", error);
      return { ok: false, error: "Could not send the SMS code. Check SMS configuration." };
    }
    return {
      ok: true,
      devCode: process.env.NODE_ENV === "development" && (process.env.SMS_PROVIDER ?? "console") === "console"
        ? code
        : undefined,
    };
  } catch (error) {
    console.error("Could not start admin password change verification", error);
    return { ok: false, error: "Could not send the SMS code. Please try again." };
  }
}

export async function completeAdminPasswordSetup(input: { phone: string; code: string; password: string }) {
  const phone = normalizeZimbabwePhone(input?.phone ?? "");
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  if (!phone || !/^\d{6}$/.test(code) || !validPassword(password)) {
    return { ok: false, error: "Enter the six-digit code and a password of at least 12 characters." };
  }

  try {
    const [challenge] = await db.select().from(adminAuthChallenges)
      .where(and(
        eq(adminAuthChallenges.phone, phone),
        eq(adminAuthChallenges.purpose, "password_setup"),
        gt(adminAuthChallenges.expiresAt, new Date()),
      ))
      .limit(1);
    if (!challenge || challenge.attempts >= 5) {
      return { ok: false, error: "The code expired or is no longer valid. Request a new one." };
    }
    const expected = Buffer.from(hashVerificationCode(phone, code), "hex");
    const actual = Buffer.from(challenge.codeHash, "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await db.update(adminAuthChallenges)
        .set({ attempts: sql`${adminAuthChallenges.attempts} + 1` })
        .where(and(
          eq(adminAuthChallenges.phone, phone),
          eq(adminAuthChallenges.purpose, "password_setup"),
          lt(adminAuthChallenges.attempts, 5),
        ));
      return { ok: false, error: "That code is incorrect. Check it and try again." };
    }

    const [admin] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (!admin) {
      return { ok: false, error: "The admin account could not be found." };
    }
    await db.transaction(async (transaction) => {
      const [consumed] = await transaction.delete(adminAuthChallenges).where(and(
        eq(adminAuthChallenges.phone, phone),
        eq(adminAuthChallenges.purpose, "password_setup"),
        eq(adminAuthChallenges.codeHash, challenge.codeHash),
        gt(adminAuthChallenges.expiresAt, new Date()),
      )).returning({ phone: adminAuthChallenges.phone });
      if (!consumed) throw new Error("The password setup code has already been used.");
      const [updated] = await transaction.update(adminUsers).set({
        passwordHash: hashAdminPassword(password),
        mustChangePassword: false,
      }).where(eq(adminUsers.id, admin.id)).returning({ id: adminUsers.id });
      if (!updated) throw new Error("Admin account no longer exists.");
      await transaction.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));
    });
    await createAdminSession(admin.id);
    return { ok: true };
  } catch (error) {
    console.error("Could not complete admin password setup", error);
    return { ok: false, error: "Could not finish admin setup. Please try again." };
  }
}

export async function signInAdmin(input: { phone: string; password: string }) {
  const phone = normalizeZimbabwePhone(input?.phone ?? "");
  const password = typeof input?.password === "string" ? input.password : "";
  if (!phone || !password || password.length > 128) {
    return { ok: false, error: "Enter your admin phone number and password." };
  }

  try {
    const [admin] = await db.select({
      id: adminUsers.id,
      passwordHash: adminUsers.passwordHash,
      mustChangePassword: adminUsers.mustChangePassword,
    }).from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (!admin?.passwordHash || !verifyAdminPassword(password, admin.passwordHash)) {
      return { ok: false, error: "The phone number or password is incorrect." };
    }
    await createAdminSession(admin.id);
    return { ok: true, mustChangePassword: admin.mustChangePassword };
  } catch (error) {
    console.error("Could not sign in admin", error);
    return { ok: false, error: "Admin sign-in failed. Please try again." };
  }
}

export async function changeAdminPassword(input: { currentPassword: string; code: string; newPassword: string }) {
  const session = await getAdminSession();
  const currentPassword = typeof input?.currentPassword === "string" ? input.currentPassword : "";
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  const newPassword = typeof input?.newPassword === "string" ? input.newPassword : "";
  if (!session) return { ok: false, error: "Sign in to your admin account first." };
  if (!validPassword(newPassword)) return { ok: false, error: "New passwords must be 12 to 128 characters." };
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "Enter the six-digit SMS verification code." };

  try {
    const [admin] = await db.select({ passwordHash: adminUsers.passwordHash })
      .from(adminUsers).where(eq(adminUsers.id, session.id)).limit(1);
    if (!admin?.passwordHash || !verifyAdminPassword(currentPassword, admin.passwordHash)) {
      return { ok: false, error: "Current password is incorrect." };
    }
    const currentPasswordHash = admin.passwordHash;

    const [challenge] = await db.select().from(adminAuthChallenges)
      .where(and(
        eq(adminAuthChallenges.phone, session.phone),
        eq(adminAuthChallenges.purpose, "password_change"),
        gt(adminAuthChallenges.expiresAt, new Date()),
      ))
      .limit(1);
    if (!challenge || challenge.attempts >= 5) {
      return { ok: false, error: "The SMS code expired or is no longer valid. Request a new one." };
    }
    const expected = Buffer.from(hashVerificationCode(session.phone, code), "hex");
    const actual = Buffer.from(challenge.codeHash, "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await db.update(adminAuthChallenges)
        .set({ attempts: sql`${adminAuthChallenges.attempts} + 1` })
        .where(and(
          eq(adminAuthChallenges.phone, session.phone),
          eq(adminAuthChallenges.purpose, "password_change"),
          lt(adminAuthChallenges.attempts, 5),
        ));
      return { ok: false, error: "That SMS code is incorrect. Check it and try again." };
    }

    await db.transaction(async (transaction) => {
      const [consumed] = await transaction.delete(adminAuthChallenges).where(and(
        eq(adminAuthChallenges.phone, session.phone),
        eq(adminAuthChallenges.purpose, "password_change"),
        eq(adminAuthChallenges.codeHash, challenge.codeHash),
        gt(adminAuthChallenges.expiresAt, new Date()),
      )).returning({ phone: adminAuthChallenges.phone });
      if (!consumed) throw new Error("The password verification code has already been used.");
      const [updated] = await transaction.update(adminUsers).set({
        passwordHash: hashAdminPassword(newPassword),
        mustChangePassword: false,
      }).where(and(
        eq(adminUsers.id, session.id),
        eq(adminUsers.passwordHash, currentPasswordHash),
      )).returning({ id: adminUsers.id });
      if (!updated) throw new Error("The admin password changed before this request completed.");
    });
    return { ok: true };
  } catch (error) {
    console.error("Could not change admin password", error);
    return { ok: false, error: "Could not change the password. Please try again." };
  }
}
