"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseClientConfig } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseClientConfig();
  return createBrowserClient(url, key);
}
