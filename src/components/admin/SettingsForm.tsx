"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsFormData } from "@/lib/validations";
import type { SiteConfig } from "@/lib/settings";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface SettingsFormProps {
  initialValues: SiteConfig;
}

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      event_name: initialValues.event_name,
      tagline: initialValues.tagline || "",
      event_start: initialValues.event_start || "",
      event_end: initialValues.event_end || "",
      venue_name: initialValues.venue_name || "",
      venue_address: initialValues.venue_address || "",
      registration_mode: initialValues.registration_mode,
      external_registration_url: initialValues.external_registration_url || "",
      sponsor_packet_url: initialValues.sponsor_packet_url || "",
      instagram_url: initialValues.instagram_url || "",
      twitter_url: initialValues.twitter_url || "",
      linkedin_url: initialValues.linkedin_url || "",
      contact_email: initialValues.contact_email || "",
    },
  });

  async function onSubmit(data: SiteSettingsFormData) {
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to save settings.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div
          className="rounded-xl border px-3 py-3 text-sm text-red-100"
          role="alert"
          style={{ background: "rgba(251,113,133,0.14)", borderColor: "rgba(251,113,133,0.35)" }}
        >
          {error}
        </div>
      )}
      {saved && (
        <div
          className="rounded-xl border px-3 py-3 text-sm text-emerald-100"
          style={{ background: "rgba(52,211,153,0.16)", borderColor: "rgba(52,211,153,0.38)" }}
        >
          Settings saved successfully.
        </div>
      )}

      <Section title="Event Details">
        <Input dark label="Event Name" required error={errors.event_name?.message} {...register("event_name")} />
        <Input dark label="Tagline" error={errors.tagline?.message} {...register("tagline")} />
        <Input dark label="Event Start Date" type="date" error={errors.event_start?.message} {...register("event_start")} />
        <Input dark label="Event End Date" type="date" error={errors.event_end?.message} {...register("event_end")} />
        <Input dark label="Venue Name" error={errors.venue_name?.message} {...register("venue_name")} />
        <Input dark label="Venue Address" error={errors.venue_address?.message} {...register("venue_address")} />
      </Section>

      <Section title="Registration">
        <Select
          dark
          label="Registration Mode"
          required
          options={[
            { value: "external", label: "External - link to Google Form or other URL" },
            { value: "internal", label: "Internal - built-in registration form" },
          ]}
          error={errors.registration_mode?.message}
          {...register("registration_mode")}
        />
        <Input
          dark
          label="External Registration URL"
          type="url"
          hint="Used when registration mode is set to External"
          placeholder="https://forms.gle/..."
          error={errors.external_registration_url?.message}
          {...register("external_registration_url")}
        />
        <Input
          dark
          label="Sponsor Packet URL"
          type="url"
          placeholder="https://..."
          error={errors.sponsor_packet_url?.message}
          {...register("sponsor_packet_url")}
        />
      </Section>

      <Section title="Contact &amp; Social">
        <Input dark label="Contact Email" type="email" error={errors.contact_email?.message} {...register("contact_email")} />
        <Input dark label="Instagram URL" type="url" placeholder="https://instagram.com/..." error={errors.instagram_url?.message} {...register("instagram_url")} />
        <Input dark label="Twitter/X URL" type="url" placeholder="https://twitter.com/..." error={errors.twitter_url?.message} {...register("twitter_url")} />
        <Input dark label="LinkedIn URL" type="url" placeholder="https://linkedin.com/..." error={errors.linkedin_url?.message} {...register("linkedin_url")} />
      </Section>

      <Button type="submit" loading={isSubmitting} size="lg" className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600">
        Save Settings
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="space-y-4 rounded-2xl border p-5"
      style={{
        background: "linear-gradient(180deg, rgba(7,20,36,0.98) 0%, rgba(10,24,48,0.96) 100%)",
        borderColor: "rgba(52,211,153,0.22)",
        boxShadow: "0 18px 42px rgba(1, 6, 16, 0.42)",
      }}
    >
      <h2
        className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: "#A7F3D0", borderColor: "rgba(52,211,153,0.18)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
