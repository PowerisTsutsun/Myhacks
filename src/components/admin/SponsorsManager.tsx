"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sponsorSchema, type SponsorFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

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

const TIER_BADGE: Record<string, "green" | "default" | "gray"> = {
  platinum: "green",
  gold: "green",
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
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { tier: "community", isPublished: true, sortOrder: rows.length },
  });

  const watchedLogoUrl = watch("logoUrl");

  function openNew() {
    setEditing(null);
    setLogoPreview(null);
    reset({ tier: "community", isPublished: true, sortOrder: rows.length });
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) return;
    if (editing) {
      reset({ name: editing.name, tier: editing.tier as SponsorFormData["tier"], logoUrl: editing.logoUrl || "", websiteUrl: editing.websiteUrl || "", description: editing.description || "", sortOrder: editing.sortOrder, isPublished: editing.isPublished });
      setLogoPreview(editing.logoUrl || null);
    } else {
      reset({ tier: "community", isPublished: true, sortOrder: rows.length });
      setLogoPreview(null);
    }
  }, [showForm, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Upload failed."); return; }
      setValue("logoUrl", json.url, { shouldValidate: true });
      setLogoPreview(json.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
            <div className="space-y-2">
              <p className="text-sm font-medium text-semantic-text-secondary">Logo (transparent PNG)</p>
              <div className="flex items-center gap-3">
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm text-semantic-text-secondary transition-colors hover:text-white"
                  style={{ borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.06)" }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,image/png"
                    className="sr-only"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {uploading ? "Uploading…" : "Upload PNG"}
                </label>
                {(logoPreview || watchedLogoUrl) && (
                  <div
                    className="flex h-10 w-24 items-center justify-center rounded-lg border"
                    style={{ borderColor: "rgba(52,211,153,0.2)", background: "repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 10px 10px" }}
                  >
                    <Image
                      src={logoPreview || watchedLogoUrl || ""}
                      alt="Logo preview"
                      width={88}
                      height={36}
                      className="max-h-9 max-w-[88px] object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <Input dark label="Or paste Logo URL" type="url" placeholder="https://..." error={errors.logoUrl?.message} {...register("logoUrl", {
                onChange: (e) => setLogoPreview(e.target.value || null),
              })} />
            </div>
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
