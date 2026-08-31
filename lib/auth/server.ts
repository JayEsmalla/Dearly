import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseAdmin, SupabaseNotConfiguredError } from "@/lib/supabase/server";

export type RequestAuthResult =
  | { state: "guest"; user: null }
  | { state: "authenticated"; user: User }
  | { state: "invalid"; user: null };

export async function getRequestUser(request: Request): Promise<RequestAuthResult> {
  const authorization = request.headers.get("authorization");
  if (!authorization) return { state: "guest", user: null };
  if (!authorization.startsWith("Bearer ")) return { state: "invalid", user: null };

  const accessToken = authorization.slice(7).trim();
  if (!accessToken) return { state: "invalid", user: null };

  try {
    const { data, error } = await createSupabaseAdmin().auth.getUser(accessToken);
    if (error || !data.user) return { state: "invalid", user: null };
    return { state: "authenticated", user: data.user };
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) throw error;
    return { state: "invalid", user: null };
  }
}
