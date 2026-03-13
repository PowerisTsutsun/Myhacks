"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRegistrationButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete registration for "${name}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to delete registration.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-medium text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
