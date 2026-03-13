"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkReadButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markRead() {
    setLoading(true);
    await fetch(`/api/admin/contact/${id}/read`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={markRead}
      disabled={loading}
      className="shrink-0 text-xs text-white/30 hover:text-emerald-400 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Mark read"}
    </button>
  );
}
