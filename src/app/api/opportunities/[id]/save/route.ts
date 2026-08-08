import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveOpportunitySchema } from "@/lib/validation/opportunity.schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = saveOpportunitySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase
    .from("opportunities")
    .update({
      is_saved: parsed.data.isSaved,
      status: parsed.data.isSaved ? "saved" : "candidate",
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
