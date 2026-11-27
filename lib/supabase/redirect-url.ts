export function authCallbackUrl(nextPath: "/admin" | "/admin/change-password" | "/admin/reset-password") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:4000");
  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}
