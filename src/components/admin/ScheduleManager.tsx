"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleDaySchema, scheduleItemSchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Day = { id: number; label: string; date: string; sortOrder: number };
type Item = { id: number; dayId: number; time: string; title: string; description: string | null; track: string | null; location: string | null; isImportant: boolean; sortOrder: number };
type DayForm = z.infer<typeof scheduleDaySchema>;
type ItemForm = z.infer<typeof scheduleItemSchema>;

export function ScheduleManager({ initialDays, initialItems }: { initialDays: Day[]; initialItems: Item[] }) {
  const [days, setDays] = useState(initialDays);
  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState<"list" | "new-day" | "edit-day" | "new-item" | "edit-item">("list");
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  // Day form
  const dayForm = useForm<DayForm>({ resolver: zodResolver(scheduleDaySchema), defaultValues: { sortOrder: days.length } });
  // Item form
  const itemForm = useForm<ItemForm>({ resolver: zodResolver(scheduleItemSchema), defaultValues: { isImportant: false, sortOrder: 0 } });

  useEffect(() => {
    if (mode === "edit-day" && editingDay) {
      dayForm.reset({ label: editingDay.label, date: editingDay.date, sortOrder: editingDay.sortOrder });
    } else if (mode === "edit-item" && editingItem) {
      itemForm.reset({ dayId: editingItem.dayId, time: editingItem.time, title: editingItem.title, description: editingItem.description, track: editingItem.track, location: editingItem.location, isImportant: editingItem.isImportant, sortOrder: editingItem.sortOrder });
    }
  }, [mode, editingDay, editingItem]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitDay(data: DayForm) {
    setError(null);
    const payload = { ...data, type: "day" };
    const url = editingDay ? `/api/admin/schedule/${editingDay.id}` : "/api/admin/schedule";
    const method = editingDay ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      if (editingDay) { setDays((p) => p.map((d) => d.id === editingDay.id ? json : d)); flash("Day updated."); }
      else { setDays((p) => [...p, json]); flash("Day created."); }
      setMode("list");
    } catch { setError("Network error."); }
  }

  async function submitItem(data: ItemForm) {
    setError(null);
    const url = editingItem ? `/api/admin/schedule/${editingItem.id}` : "/api/admin/schedule";
    const method = editingItem ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      if (editingItem) { setItems((p) => p.map((i) => i.id === editingItem.id ? json : i)); flash("Item updated."); }
      else { setItems((p) => [...p, json]); flash("Item created."); }
      setMode("list");
    } catch { setError("Network error."); }
  }

  async function deleteDay(id: number) {
    if (!confirm("Delete this day and all its items?")) return;
    await fetch(`/api/admin/schedule/${id}?type=day`, { method: "DELETE" });
    setDays((p) => p.filter((d) => d.id !== id));
    setItems((p) => p.filter((i) => i.dayId !== id));
    flash("Deleted.");
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this schedule item?")) return;
    await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i.id !== id));
    flash("Deleted.");
  }

  if (mode === "new-day" || mode === "edit-day") {
    return (
      <div className="admin-surface max-w-md rounded-2xl border p-5" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">{editingDay ? "Edit Day" : "Add Day"}</h2>
          <Button size="sm" variant="ghost" onClick={() => setMode("list")}>Cancel</Button>
        </div>
        {error && <div className="mb-3 rounded-xl border px-3 py-3 text-sm text-red-100" style={{ background: "rgba(251,113,133,0.14)", borderColor: "rgba(251,113,133,0.35)" }}>{error}</div>}
        <form onSubmit={dayForm.handleSubmit(submitDay)} className="space-y-4">
          <Input dark label="Label" required hint='e.g. "Friday, Oct 10"' error={dayForm.formState.errors.label?.message} {...dayForm.register("label")} />
          <Input dark label="Date" required hint='e.g. "October 10, 2025"' error={dayForm.formState.errors.date?.message} {...dayForm.register("date")} />
          <Input dark label="Sort Order" type="number" error={dayForm.formState.errors.sortOrder?.message} {...dayForm.register("sortOrder", { valueAsNumber: true })} />
          <div className="flex gap-2">
            <Button type="submit" loading={dayForm.formState.isSubmitting}>{editingDay ? "Update" : "Create"}</Button>
            <Button type="button" variant="ghost" onClick={() => setMode("list")}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === "new-item" || mode === "edit-item") {
    return (
      <div className="admin-surface max-w-lg rounded-2xl border p-5" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">{editingItem ? "Edit Schedule Item" : "Add Schedule Item"}</h2>
          <Button size="sm" variant="ghost" onClick={() => setMode("list")}>Cancel</Button>
        </div>
        {error && <div className="mb-3 rounded-xl border px-3 py-3 text-sm text-red-100" style={{ background: "rgba(251,113,133,0.14)", borderColor: "rgba(251,113,133,0.35)" }}>{error}</div>}
        <form onSubmit={itemForm.handleSubmit(submitItem)} className="space-y-4">
          <Select
            dark
            label="Day"
            required
            options={days.map((d) => ({ value: String(d.id), label: d.label }))}
            error={itemForm.formState.errors.dayId?.message}
            {...itemForm.register("dayId", { valueAsNumber: true })}
          />
          <Input dark label="Time" required placeholder="e.g. 9:00 AM" error={itemForm.formState.errors.time?.message} {...itemForm.register("time")} />
          <Input dark label="Title" required error={itemForm.formState.errors.title?.message} {...itemForm.register("title")} />
          <Textarea dark label="Description" error={itemForm.formState.errors.description?.message} {...itemForm.register("description")} />
          <Input dark label="Track" placeholder="e.g. Workshop, Hacking" error={itemForm.formState.errors.track?.message} {...itemForm.register("track")} />
          <Input dark label="Location" placeholder="e.g. Room 101" error={itemForm.formState.errors.location?.message} {...itemForm.register("location")} />
          <Input dark label="Sort Order" type="number" error={itemForm.formState.errors.sortOrder?.message} {...itemForm.register("sortOrder", { valueAsNumber: true })} />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-semantic-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded border-emerald-400/30 bg-transparent text-emerald-500" {...itemForm.register("isImportant")} />
            Mark as Important Event
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={itemForm.formState.isSubmitting}>{editingItem ? "Update" : "Create"}</Button>
            <Button type="button" variant="ghost" onClick={() => setMode("list")}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {success && (
        <div className="mb-4 rounded-xl border px-3 py-3 text-sm text-emerald-100" style={{ background: "rgba(52,211,153,0.16)", borderColor: "rgba(52,211,153,0.38)" }}>
          ✓ {success}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <Button onClick={() => { dayForm.reset({ sortOrder: days.length }); setEditingDay(null); setMode("new-day"); }}>
          + Add Day
        </Button>
        <Button
          variant="outline"
          disabled={days.length === 0}
          onClick={() => {
            const defaultDayId = days[0]?.id;
            itemForm.reset({ isImportant: false, sortOrder: 0, dayId: defaultDayId });
            setEditingItem(null);
            setMode("new-item");
          }}
        >
          + Add Schedule Item
        </Button>
      </div>

      {days.length === 0 ? (
        <div className="admin-surface rounded-2xl border p-10 text-center" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
          <p className="text-semantic-text-muted">No schedule days yet. Add a day to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.id} className="admin-surface overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ background: "rgba(11,29,47,0.98)", borderColor: "rgba(52,211,153,0.16)" }}>
                <div>
                  <span className="font-semibold text-white">{day.label}</span>
                  <span className="ml-2 text-sm text-semantic-text-muted">{day.date}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditingDay(day);
                    setMode("edit-day");
                  }}>Edit Day</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteDay(day.id)}>Delete Day</Button>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
                {items.filter((i) => i.dayId === day.id).length === 0 ? (
                  <p className="p-4 text-sm text-semantic-text-muted">No items for this day.</p>
                ) : (
                  items.filter((i) => i.dayId === day.id).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-16 font-mono text-xs text-semantic-text-muted">{item.time}</span>
                          <span className="text-sm text-white">{item.title}</span>
                          {item.isImportant && <Badge variant="laser">Key</Badge>}
                          {item.track && <Badge variant="default" className="capitalize">{item.track}</Badge>}
                        </div>
                        {item.description && <p className="mt-0.5 ml-16 line-clamp-1 text-xs text-semantic-text-muted">{item.description}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingItem(item);
                          setMode("edit-item");
                        }}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => deleteItem(item.id)}>Delete</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
