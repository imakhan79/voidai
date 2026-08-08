"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaveOpportunityButton({
  opportunityId,
  initialSaved,
}: {
  opportunityId: string;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setSubmitting(true);
    const res = await fetch(`/api/opportunities/${opportunityId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSaved: !saved }),
    });
    if (res.ok) {
      setSaved(!saved);
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={submitting}
      className={`rounded px-3 py-2 text-sm font-medium disabled:opacity-50 ${
        saved
          ? "border border-accent text-accent"
          : "bg-accent text-accent-foreground"
      }`}
    >
      {saved ? "Saved" : "Save opportunity"}
    </button>
  );
}
