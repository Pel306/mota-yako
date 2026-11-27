"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { hashVerificationCode } from "@/lib/auth-code";
import { normalizeZimbabwePhone } from "@/lib/auth";
import { hashAdminPassword } from "@/lib/admin-password";
import { db } from "@/lib/db";
import { sendVerificationCode } from "@/lib/sms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminAuthChallenges, adminUsers } from "@/src/db/schema";

function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}

export async function requestAdminEmailSetupCode(rawPhone: string) {
  const phone = normalizeZimbabwePhone(typeof rawPhone === "string" ? rawPhone : "");
  if (!phone) return { ok: false, error: "Enter a valid admin phone number." };

  try {
    const [admin] = await db.select({ id: adminUsers.id, email: adminUsers.email })
      .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (!admin) return { ok: false, error: "Email setup is not available for this admin account." };
    if (admin.email) {
      return { ok: false, error: "A recovery email is already set. Use password reset or ask an admin manager to update it." };
    }

    const [previousChallenge] = await db.select({ createdAt: adminAuthChallenges.createdAt })
      .from(adminAuthChallenges).where(eq(adminAuthChallenges.phone, phone)).limit(1);
    if (previousChallenge && Date.now() - previousChallenge.createdAt.getTime() < 60_000) {
      return { ok: false, error: "Wait one minute before requesting another code." };
    }

    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    await db.insert(adminAuthChallenges).values({
      phone,
      purpose: "email_setup",
      codeHash: hashVerificationCode(phone, code),
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
    }).onConflictDoUpdate({
      target: adminAuthChallenges.phone,
      set: {
        purpose: "email_setup",
        codeHash: hashVerificationCode(phone, code),
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      },
    });

    try {
      await sendVerificationCode(phone, code, "admin email setup");
    } catch (error) {
      await db.delete(adminAuthChallenges)
        .where(and(eq(adminAuthChallenges.phone, phone), eq(adminAuthChallenges.purpose, "email_setup")));
      console.error("Could not send admin email setup code", error);
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
    console.error("Could not start admin email setup", error);
    return { ok: false, error: "Could not start email setup. Please try again." };
  }
}

export async function completeAdminEmailSetup(input: { phone: string; email: string; code: string }) {
  const phone = normalizeZimbabwePhone(typeof input?.phone === "string" ? input.phone : "");
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const code = typeof input?.code === "string" ? input.code.trim() : "";
  if (!phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter a valid email address and the six-digit SMS code." };
  }

  try {
    const [challenge] = await db.select().from(adminAuthChallenges)
      .where(and(
        eq(adminAuthChallenges.phone, phone),
        eq(adminAuthChallenges.purpose, "email_setup"),
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
          eq(adminAuthChallenges.purpose, "email_setup"),
          lt(adminAuthChallenges.attempts, 5),
        ));
      return { ok: false, error: "That code is incorrect. Check it and try again." };
    }

    const [admin] = await db.select({ id: adminUsers.id, email: adminUsers.email })
      .from(adminUsers).where(eq(adminUsers.phone, phone)).limit(1);
    if (!admin || admin.email) {
      return { ok: false, error: "Email setup is no longer available for this admin account." };
    }
    const [emailOwner] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (emailOwner) return { ok: false, error: "That email is already assigned to an admin account." };

    await db.transaction(async (transaction) => {
      const [consumed] = await transaction.delete(adminAuthChallenges).where(and(
        eq(adminAuthChallenges.phone, phone),
        eq(adminAuthChallenges.purpose, "email_setup"),
        eq(adminAuthChallenges.codeHash, challenge.codeHash),
        gt(adminAuthChallenges.expiresAt, new Date()),
      )).returning({ phone: adminAuthChallenges.phone });
      if (!consumed) throw new Error("The email setup code has already been used.");
      const [updated] = await transaction.update(adminUsers).set({ email })
        .where(and(eq(adminUsers.id, admin.id), sql`${adminUsers.email} IS NULL`))
        .returning({ id: adminUsers.id });
      if (!updated) throw new Error("Admin email setup has already been completed.");
    });

    return { ok: true, email };
  } catch (error) {
    console.error("Could not complete admin email setup", error);
    return { ok: false, error: "Could not save the recovery email. Check whether it is already in use." };
  }
}

export async function requestAdminSupabasePasswordReset(rawEmail: string) {
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid admin email address." };
  }

  try {
    const [admin] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!admin) {
      return { ok: true, message: "If that email belongs to an admin account, a reset link will be sent." };
    }

    const supabase = await createSupabaseServerClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:4000");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?next=/admin/reset-password`,
    });
    if (error) {
      console.error("Could not request Supabase password reset", error);
      return { ok: false, error: "Could not send the reset email. Please try again." };
    }
    return { ok: true, message: "Check your email for the Supabase password reset link." };
  } catch (error) {
    console.error("Could not request Supabase password reset", error);
    return { ok: false, error: "Could not send the reset email. Please try again." };
  }
}

export async function syncAdminSupabasePassword(password: string) {
  const value = typeof password === "string" ? password : "";
  if (!validPassword(value)) {
    return { ok: false, error: "Passwords must be 12 to 128 characters." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) {
      return { ok: false, error: "Your reset session expired. Request a new link." };
    }
    const email = data.user.email.toLowerCase();
    const [admin] = await db.select({ id: adminUsers.id })
      .from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!admin) {
      return { ok: false, error: "This email is not assigned to an admin account." };
    }
    await db.update(adminUsers).set({
      passwordHash: hashAdminPassword(value),
      mustChangePassword: false,
    }).where(eq(adminUsers.id, admin.id));
    return { ok: true };
  } catch (error) {
    console.error("Could not sync admin password after Supabase reset", error);
    return { ok: false, error: "Could not finish syncing the password. Please try again." };
  }
}
