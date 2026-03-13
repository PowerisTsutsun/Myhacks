"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sponsorSchema, type SponsorFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Row = {
  id: number;
  name: string;
  tier: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
};

const TIER_BADGE: Record<string, "laser" | "gold" | "default" | "gray"> = {
  platinum: "laser",
  gold: "gold",
  silver: "default",
  bronze: "default",
  community: "gray",
};

export function SponsorsManager({ initialData }: { initialData: Row[] }) {
  const [rows, setRows] = useState(initialData);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { tier: "community", isPublished: true, sortOrder: rows.length },
  });

  function openNew() {
    setEditing(null);
    reset({ tier: "community", isPublished: true, sortOrder: rows.length });
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) return;
    if (editing) {
      reset({ name: editing.name, tier: editing.tier as SponsorFormData["tier"], logoUrl: editing.logoUrl || "", websiteUrl: editing.websiteUrl || "", description: editing.description || "", sortOrder: editing.sortOrder, isPublished: editing.isPublished });
    } else {
      reset({ tier: "community", isPublished: true, sortOrder: rows.length });
    }
  }, [showForm, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  async function onSubmit(data: SponsorFormData) {
    setError(null);
    const url = editing ? `/api/admin/sponsors/${editing.id}` : "/api/admin/sponsors";
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      if (editing) { setRows((p) => p.map((r) => r.id === editing.id ? json : r)); flash("Updated."); }
      else { setRows((p) => [...p, json]); flash("Created."); }
      setShowForm(false);
    } catch { setError("Network error."); }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this sponsor?")) return;
    await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
    setRows((p) => p.filter((r) => r.id !== id));
    flash("Deleted.");
  }

  return (
    <div>
      {success && (
        <div className="mb-4 rounded-xl border px-3 py-3 text-sm text-emerald-100" style={{ background: "rgba(52,211,153,0.16)", borderColor: "rgba(52,211,153,0.38)" }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border px-3 py-3 text-sm text-red-100" style={{ background: "rgba(251,113,133,0.14)", borderColor: "rgba(251,113,133,0.35)" }}>
          {error}
        </div>
      )}

      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-semantic-text-muted">{rows.length} sponsor{rows.length !== 1 ? "s" : ""}</p>
            <Button onClick={openNew}>+ Add Sponsor</Button>
          </div>
          {rows.length === 0 ? (
            <div className="admin-surface rounded-2xl border p-10 text-center" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
              <p className="mb-3 text-semantic-text-muted">No sponsors added yet.</p>
              <Button onClick={openNew} variant="outline">Add first sponsor</Button>
            </div>
          ) : (
            <div className="admin-surface divide-y rounded-2xl border" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{row.name}</span>
                      <Badge variant={TIER_BADGE[row.tier] || "default"} className="capitalize">{row.tier}</Badge>
                      {!row.isPublished && <Badge variant="gray">Hidden</Badge>}
                    </div>
                    {row.websiteUrl && <p className="mt-0.5 truncate text-xs text-semantic-text-muted">{row.websiteUrl}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteRow(row.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="admin-surface max-w-xl rounded-2xl border p-5" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">{editing ? "Edit Sponsor" : "Add Sponsor"}</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input dark label="Sponsor Name" required error={errors.name?.message} {...register("name")} />
            <Select
              dark
              label="Tier"
              required
              options={[
                { value: "platinum", label: "Platinum" },
                { value: "gold", label: "Gold" },
                { value: "silver", label: "Silver" },
                { value: "bronze", label: "Bronze" },
                { value: "community", label: "Community" },
              ]}
              error={errors.tier?.message}
              {...register("tier")}
            />
            <Input dark label="Logo URL" type="url" placeholder="https://..." error={errors.logoUrl?.message} {...register("logoUrl")} />
            <Input dark label="Website URL" type="url" placeholder="https://..." error={errors.websiteUrl?.message} {...register("websiteUrl")} />
            <Input dark label="Description (optional)" error={errors.description?.message} {...register("description")} />
            <Input dark label="Sort Order" type="number" error={errors.sortOrder?.message} {...register("sortOrder", { valueAsNumber: true })} />
            <label className="flex items-center gap-2 cursor-pointer text-sm text-semantic-text-secondary">
              <input type="checkbox" className="h-4 w-4 rounded border-emerald-400/30 bg-transparent text-emerald-500" {...register("isPublished")} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit" loading={isSubmitting}>{editing ? "Update" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
