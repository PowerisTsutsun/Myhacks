"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqItemSchema, type FaqItemFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Row = {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
};

export function FaqManager({ initialData }: { initialData: Row[] }) {
  const [rows, setRows] = useState(initialData);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FaqItemFormData>({
    resolver: zodResolver(faqItemSchema),
    defaultValues: { isPublished: true, category: "general", sortOrder: rows.length },
  });

  function openNew() {
    setEditing(null);
    reset({ isPublished: true, category: "general", sortOrder: rows.length });
    setShowForm(true);
  }

  useEffect(() => {
    if (!showForm) return;
    if (editing) {
      reset({ question: editing.question, answer: editing.answer, category: editing.category, sortOrder: editing.sortOrder, isPublished: editing.isPublished });
    } else {
      reset({ isPublished: true, category: "general", sortOrder: rows.length });
    }
  }, [showForm, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(row: Row) {
    setEditing(row);
    setShowForm(true);
  }

  async function onSubmit(data: FaqItemFormData) {
    setError(null);
    const url = editing ? `/api/admin/faq/${editing.id}` : "/api/admin/faq";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      if (editing) { setRows((prev) => prev.map((r) => r.id === editing.id ? json : r)); flash("Updated."); }
      else { setRows((prev) => [...prev, json]); flash("Created."); }
      setShowForm(false);
    } catch { setError("Network error."); }
  }

  async function deleteRow(id: number) {
    if (!confirm("Delete this FAQ item?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
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
            <Button onClick={openNew}>+ New FAQ Item</Button>
          </div>
          {rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 mb-3">No FAQ items yet.</p>
              <Button onClick={openNew} variant="outline">Add your first FAQ</Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-navy-900 text-sm">{row.question}</span>
                      <Badge variant={row.isPublished ? "green" : "gray"}>{row.isPublished ? "Published" : "Hidden"}</Badge>
                      <Badge variant="default" className="capitalize">{row.category}</Badge>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2">{row.answer}</p>
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-900">{editing ? "Edit FAQ" : "New FAQ Item"}</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea label="Question" required error={errors.question?.message} {...register("question")} />
            <Textarea label="Answer" required className="min-h-[120px]" error={errors.answer?.message} {...register("answer")} />
            <Input label="Category" hint='e.g. "general", "teams", "prizes"' error={errors.category?.message} {...register("category")} />
            <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register("sortOrder", { valueAsNumber: true })} />
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-laser-500" {...register("isPublished")} />
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
