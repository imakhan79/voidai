// One-off: create a confirmed demo account via the Auth admin API (bypasses
// email confirmation, since this is a maintainer-facing demo login, not a
// real signup). Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] ?? "demo@voidai.app";
const password = process.argv[3] ?? "VoidDemo2026!";

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log("Demo user created:");
console.log("  id:", data.user.id);
console.log("  email:", email);
console.log("  password:", password);
