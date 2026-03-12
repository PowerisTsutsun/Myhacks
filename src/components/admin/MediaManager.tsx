"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mediaItemSchema, type MediaItemFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Row = {
  id: number;
  type: string;
  title: string;
  caption: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  externalUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export function MediaManager({ initialData }: { initialData: Row[] }) {
  const [rows, setRows] = useState(initialData);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MediaItemFormData>({
    resolver: zodResolver(mediaItemSchema),
    defaultValues: { type: "youtube", isPublished: true, isFeatured: false, sortOrder: rows.length },
  });

  function openNew() {
    setEditing(null);
    reset({ type: "youtube", isPublished: true, isFeatured: false, sortOrder: rows.length });
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) return;
    if (editing) {
      reset({ type: editing.type as MediaItemFormData["type"], title: editing.title, caption: editing.caption || "", embedUrl: editing.embedUrl || "", thumbnailUrl: editing.thumbnailUrl || "", externalUrl: editing.externalUrl || "", isFeatured: editing.isFeatured, isPublished: editing.isPublished, sortOrder: editing.sortOrder });
    } else {
      reset({ type: "youtube", isPublished: true, isFeatured: false, sortOrder: rows.length });
    }
  }, [showForm, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  async function onSubmit(data: MediaItemFormData) {
    setError(null);
    const url = editing ? `/api/admin/media/${editing.id}` : "/api/admin/media";
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
    if (!confirm("Delete this media item?")) return;
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setRows((p) => p.filter((r) => r.id !== id));
    flash("Deleted.");
  }

  return (
    <div>
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">✓ {success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">{rows.length} item{rows.length !== 1 ? "s" : ""}</p>
            <Button onClick={openNew}>+ Add Media</Button>
          </div>
          {rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 mb-3">No media items yet.</p>
              <Button onClick={openNew} variant="outline">Add first item</Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-navy-900 text-sm">{row.title}</span>
                      <Badge variant="default" className="capitalize">{row.type}</Badge>
                      {row.isFeatured && <Badge variant="gold">Featured</Badge>}
                      {!row.isPublished && <Badge variant="gray">Hidden</Badge>}
                    </div>
                    {row.caption && <p className="text-slate-400 text-xs truncate">{row.caption}</p>}
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-900">{editing ? "Edit Media Item" : "Add Media Item"}</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
              label="Type"
              required
              options={[
                { value: "youtube", label: "YouTube" },
                { value: "instagram", label: "Instagram" },
                { value: "video", label: "Video" },
                { value: "image", label: "Image" },
                { value: "link", label: "Link" },
              ]}
              error={errors.type?.message}
              {...register("type")}
            />
            <Input label="Title" required error={errors.title?.message} {...register("title")} />
            <Textarea label="Caption" error={errors.caption?.message} {...register("caption")} />
            <Input label="Embed URL" hint="YouTube URL, Instagram post URL, etc." error={errors.embedUrl?.message} {...register("embedUrl")} />
            <Input label="Thumbnail URL" hint="Optional image preview URL" error={errors.thumbnailUrl?.message} {...register("thumbnailUrl")} />
            <Input label="External Link" hint="Where users click through to" error={errors.externalUrl?.message} {...register("externalUrl")} />
            <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register("sortOrder", { valueAsNumber: true })} />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-laser-500" {...register("isFeatured")} />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-laser-500" {...register("isPublished")} />
                Published
              </label>
            </div>
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
