"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema, type AnnouncementFormData } from "@/lib/validations";
import { slugify, formatDateShort } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Row = {
  id: number;
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function AnnouncementsManager({ initialData }: { initialData: Row[] }) {
  const [rows, setRows] = useState(initialData);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { isPublished: false },
  });

  const titleValue = watch("title");

  function openNew() {
    setEditing(null);
    reset({ isPublished: false, title: "", slug: "", body: "" });
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) return;
    if (editing) {
      reset({
        title: editing.title,
        slug: editing.slug,
        body: editing.body,
        isPublished: editing.isPublished,
      });
    } else {
      reset({ isPublished: false, title: "", slug: "", body: "" });
    }
  }, [showForm, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  async function onSubmit(data: AnnouncementFormData) {
    setError(null);
    const slug = data.slug || slugify(data.title);
    const payload = { ...data, slug };

    const url = editing
      ? `/api/admin/announcements/${editing.id}`
      : "/api/admin/announcements";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }

      if (editing) {
        setRows((prev) => prev.map((r) => (r.id === editing.id ? json : r)));
        flash("Announcement updated.");
      } else {
        setRows((prev) => [json, ...prev]);
        flash("Announcement created.");
      }
      setShowForm(false);
    } catch {
      setError("Network error.");
    }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
    flash("Deleted.");
  }

  return (
    <div>
      {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">✓ {success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">{error}</div>}

      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">{rows.length} item{rows.length !== 1 ? "s" : ""}</p>
            <Button onClick={openNew}>+ New Announcement</Button>
          </div>

          {rows.length === 0 ? (
            <EmptyState label="No announcements yet." onAdd={openNew} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-navy-900 text-sm">{row.title}</span>
                      <Badge variant={row.isPublished ? "green" : "gray"}>
                        {row.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {formatDateShort(row.createdAt)} · /{row.slug}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{row.body}</p>
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-900">{editing ? "Edit Announcement" : "New Announcement"}</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Title"
              required
              error={errors.title?.message}
              {...register("title", {
                onChange: (e) => {
                  if (!editing) setValue("slug", slugify(e.target.value));
                },
              })}
            />
            <Input
              label="Slug"
              required
              hint="URL-friendly identifier"
              error={errors.slug?.message}
              {...register("slug")}
            />
            <Textarea label="Body" required error={errors.body?.message} className="min-h-[160px]" {...register("body")} />
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-laser-500" {...register("isPublished")} />
              Publish immediately
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

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <p className="text-slate-400 mb-3">{label}</p>
      <Button onClick={onAdd} variant="outline">Get started</Button>
    </div>
  );
}
