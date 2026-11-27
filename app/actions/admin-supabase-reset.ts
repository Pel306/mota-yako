"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { authCallbackUrl } from "@/lib/supabase/redirect-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminUsers } from "@/src/db/schema";

export async function requestAdminSupabasePasswordReset(rawEmail: string) {
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid admin email address." };
  }

  try {
    const [admin] = await db.select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(sql`lower(${adminUsers.email})`, email))
      .limit(1);
    if (!admin) {
      return { ok: true, message: "If that email belongs to an admin account, a reset link will be sent." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl("/admin/reset-password"),
    });
    if (error) {
      console.error("Could not request Supabase password reset", error);
      return { ok: false, error: "Could not send the reset email. Please try again." };
    }
    return { ok: true, message: "If that email belongs to an admin account, a reset link will be sent." };
  } catch (error) {
    console.error("Could not request Supabase password reset", error);
    return { ok: false, error: "Could not send the reset email. Please try again." };
  }
}
