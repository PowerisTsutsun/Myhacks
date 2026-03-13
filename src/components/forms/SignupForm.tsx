"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations";
import type { SignupFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignupForm({ redirectTo = "/register" }: { redirectTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupFormData) {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create account.");
        return;
      }
      // Logged in — redirect to destination with verify banner
      router.push(`${redirectTo}?verify=pending`);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div
        className="rounded-lg border px-3 py-2.5 text-xs text-yellow-300/70"
        style={{ background: "rgba(234,179,8,0.06)", borderColor: "rgba(234,179,8,0.2)" }}
      >
        @ivc.edu verification can take up to 6mins due to IVC&apos;s Microsoft 365 filtering.
      </div>
      {error && (
        <div
          className="p-3 rounded-lg text-sm text-red-300 border border-red-500/30"
          style={{ background: "rgba(239,68,68,0.1)" }}
          role="alert"
        >
          {error}
        </div>
      )}

      <Input dark label="Full Name" type="text" required autoComplete="name"
        error={errors.name?.message} {...register("name")} />

      <Input dark label="Email" type="email" required autoComplete="email"
        error={errors.email?.message} {...register("email")} />

      <Input dark label="Password" type="password" required autoComplete="new-password"
        hint="At least 8 characters"
        error={errors.password?.message} {...register("password")} />

      <Input dark label="Confirm Password" type="password" required autoComplete="new-password"
        error={errors.confirmPassword?.message} {...register("confirmPassword")} />

      <Button type="submit" loading={isSubmitting} className="w-full justify-center">
        Create Account
      </Button>
    </form>
  );
}
