"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          reset((prev) => ({
            ...prev,
            name: data.user.name ?? "",
            email: data.user.email ?? "",
          }));
        }
      })
      .catch(() => {});
  }, [reset]);

  async function onSubmit(data: ContactFormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3" role="img" aria-label="Sent">✉️</div>
        <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
        <p className="text-white/50 text-sm">We&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot */}
      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

      {serverError && (
        <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }} role="alert">
          {serverError}
        </div>
      )}

      <Input
        dark
        label="Your Name"
        required
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        dark
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        dark
        label="Subject"
        required
        placeholder="e.g. Sponsorship Inquiry, General Question"
        error={errors.subject?.message}
        {...register("subject")}
      />

      <Textarea
        dark
        label="Message"
        required
        placeholder="Tell us what's on your mind..."
        className="min-h-[140px]"
        error={errors.message?.message}
        {...register("message")}
      />

      <Button
        type="submit"
        loading={isSubmitting}
        className="w-full justify-center"
      >
        Send Message
      </Button>
    </form>
  );
}
