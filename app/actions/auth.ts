"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  createSellerSession,
  normalizeZimbabwePhone,
  clearSellerSession,
} from "@/lib/auth";
import { hashVerificationCode } from "@/lib/auth-code";
import { sendVerificationCode } from "@/lib/sms";
import { authChallenges, sellers } from "@/src/db/schema";

type SellerType = "private" | "dealer";

export async function requestSellerCode(input: {
  name: string;
  phone: string;
  sellerType: SellerType;
  dealerName?: string;
}) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Enter your name and contact details." };
  }
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const dealerName = typeof input.dealerName === "string" ? input.dealerName.trim() || null : null;
  const phone = typeof input.phone === "string" ? normalizeZimbabwePhone(input.phone) : null;
  const sellerType = input.sellerType;

  if (!phone || name.length < 2 || name.length > 120) {
    return { ok: false, error: "Enter your name and a valid Zimbabwean mobile number." };
  }
  if (sellerType !== "private" && sellerType !== "dealer") {
    return { ok: false, error: "Choose a valid seller type." };
  }
  if (sellerType === "dealer" && (!dealerName || dealerName.length > 160)) {
    return { ok: false, error: "Enter a dealer or business name (up to 160 characters)." };
  }

  try {
    const [existingChallenge] = await db
      .select({ createdAt: authChallenges.createdAt })
      .from(authChallenges)
      .where(eq(authChallenges.phone, phone))
      .limit(1);

    if (existingChallenge && Date.now() - existingChallenge.createdAt.getTime() < 60_000) {
      return { ok: false, error: "Wait one minute before requesting another code." };
    }

    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    await db
      .insert(authChallenges)
      .values({
        phone,
        name,
        sellerType,
        dealerName: sellerType === "dealer" ? dealerName : null,
        codeHash: hashVerificationCode(phone, code),
        attempts: 0,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      })
      .onConflictDoUpdate({
        target: authChallenges.phone,
        set: {
          name,
          sellerType,
          dealerName: sellerType === "dealer" ? dealerName : null,
          codeHash: hashVerificationCode(phone, code),
          attempts: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 10 * 60_000),
        },
      });

    try {
      await sendVerificationCode(phone, code, "sign-in");
    } catch (error) {
      await db.delete(authChallenges).where(eq(authChallenges.phone, phone));
      console.error("Could not send seller verification code", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not send the verification code.",
      };
    }

    return {
      ok: true,
      phone,
      devCode: process.env.NODE_ENV === "development" && (process.env.SMS_PROVIDER ?? "console") === "console"
        ? code
        : undefined,
    };
  } catch (error) {
    console.error("Could not create seller verification challenge", error);
    return { ok: false, error: "We could not start verification. Please try again." };
  }
}

export async function verifySellerCode(input: { phone: string; code: string }) {
  const phone = normalizeZimbabwePhone(input.phone);
  const code = input.code.trim();
  if (!phone || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the six-digit code sent to your phone." };
  }

  try {
    const [challenge] = await db
      .select()
      .from(authChallenges)
      .where(and(eq(authChallenges.phone, phone), gt(authChallenges.expiresAt, new Date())))
      .limit(1);
    if (!challenge || challenge.attempts >= 5) {
      return { ok: false, error: "The code expired or is no longer valid. Request a new code." };
    }

    const expected = Buffer.from(hashVerificationCode(phone, code), "hex");
    const actual = Buffer.from(challenge.codeHash, "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await db
        .update(authChallenges)
        .set({ attempts: sql`${authChallenges.attempts} + 1` })
        .where(eq(authChallenges.phone, phone));
      return { ok: false, error: "That code is incorrect. Check it and try again." };
    }

    const [seller] = await db
      .insert(sellers)
      .values({
        name: challenge.name,
        phone,
        type: challenge.sellerType,
        dealerName: challenge.dealerName,
      })
      .onConflictDoUpdate({
        target: sellers.phone,
        set: {
          name: challenge.name,
          type: challenge.sellerType,
          dealerName: challenge.dealerName,
        },
      })
      .returning({ id: sellers.id });

    await db.delete(authChallenges).where(eq(authChallenges.phone, phone));
    await createSellerSession(seller.id);
    return { ok: true };
  } catch (error) {
    console.error("Could not verify seller sign-in code", error);
    return { ok: false, error: "We could not verify your code. Please try again." };
  }
}

export async function signOutSeller() {
  await clearSellerSession();
}
