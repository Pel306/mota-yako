"use server";

import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminUsers } from "@/src/db/schema";

function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}

export async function signInAdmin(input: { email: string; password: string }) {
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password || password.length > 128) {
    return { ok: false, error: "Enter a valid admin email and password." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "The email or password is incorrect." };

    const admin = await getAdminSession({ allowPasswordChange: true });
    if (!admin) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      return { ok: false, error: "This account is not authorized for admin access." };
    }

    return { ok: true, mustChangePassword: admin.mustChangePassword };
  } catch (error) {
    console.error("Could not sign in admin with Supabase Auth", error);
    return { ok: false, error: "Admin sign-in failed. Please try again." };
  }
}

export async function updateAdminPassword(password: string) {
  if (typeof password !== "string" || !validPassword(password)) {
    return { ok: false, error: "Passwords must be 12 to 128 characters." };
  }

  try {
    const admin = await getAdminSession({ allowPasswordChange: true });
    if (!admin) return { ok: false, error: "Sign in to your admin account first." };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("Could not update admin password with Supabase Auth", error);
      return { ok: false, error: "Could not update your password. Please try again." };
    }

    await db.update(adminUsers)
      .set({ mustChangePassword: false })
      .where(eq(adminUsers.id, admin.id));
    return { ok: true };
  } catch (error) {
    console.error("Could not update admin password with Supabase Auth", error);
    return { ok: false, error: "Could not update your password. Please try again." };
  }
}
