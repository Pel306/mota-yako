import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = requestedNext === "/admin/change-password" || requestedNext === "/admin/reset-password"
    ? requestedNext
    : "/admin";
  if (!code) return NextResponse.redirect(new URL("/admin/sign-in", request.url));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/admin/sign-in?reset=expired", request.url));

  return NextResponse.redirect(new URL(next, request.url));
}
