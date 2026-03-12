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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          ✓ Settings saved successfully.
        </div>
      )}

      <Section title="Event Details">
        <Input label="Event Name" required error={errors.event_name?.message} {...register("event_name")} />
        <Input label="Tagline" error={errors.tagline?.message} {...register("tagline")} />
        <Input label="Event Start Date" type="date" error={errors.event_start?.message} {...register("event_start")} />
        <Input label="Event End Date" type="date" error={errors.event_end?.message} {...register("event_end")} />
        <Input label="Venue Name" error={errors.venue_name?.message} {...register("venue_name")} />
        <Input label="Venue Address" error={errors.venue_address?.message} {...register("venue_address")} />
      </Section>

      <Section title="Registration">
        <Select
          label="Registration Mode"
          required
          options={[
            { value: "external", label: "External — link to Google Form or other URL" },
            { value: "internal", label: "Internal — built-in registration form" },
          ]}
          error={errors.registration_mode?.message}
          {...register("registration_mode")}
        />
        <Input
          label="External Registration URL"
          type="url"
          hint="Used when registration mode is set to External"
          placeholder="https://forms.gle/..."
          error={errors.external_registration_url?.message}
          {...register("external_registration_url")}
        />
        <Input
          label="Sponsor Packet URL"
          type="url"
          placeholder="https://..."
          error={errors.sponsor_packet_url?.message}
          {...register("sponsor_packet_url")}
        />
      </Section>

      <Section title="Contact &amp; Social">
        <Input label="Contact Email" type="email" error={errors.contact_email?.message} {...register("contact_email")} />
        <Input label="Instagram URL" type="url" placeholder="https://instagram.com/..." error={errors.instagram_url?.message} {...register("instagram_url")} />
        <Input label="Twitter/X URL" type="url" placeholder="https://twitter.com/..." error={errors.twitter_url?.message} {...register("twitter_url")} />
        <Input label="LinkedIn URL" type="url" placeholder="https://linkedin.com/..." error={errors.linkedin_url?.message} {...register("linkedin_url")} />
      </Section>

      <Button type="submit" loading={isSubmitting} size="lg">
        Save Settings
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h2 className="font-semibold text-navy-900 text-sm uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
