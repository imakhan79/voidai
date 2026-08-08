import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgId } from "@/lib/org";
import { createDiscoverySchema } from "@/lib/validation/discovery.schema";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getCurrentOrgId(supabase, user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createDiscoverySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("discoveries")
    .insert({
      org_id: orgId,
      created_by: user.id,
      title: parsed.data.title,
      problem_statement: parsed.data.problemStatement,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create discovery" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
