import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * MVP default: every user has exactly one org (auto-created on signup by the
 * `handle_new_user` trigger). Multi-member/multi-org UI is P1 — this just
 * takes the first membership.
 */
export async function getCurrentOrgId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.org_id;
}
