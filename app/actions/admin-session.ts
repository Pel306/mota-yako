"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/auth";

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/sign-in");
}
