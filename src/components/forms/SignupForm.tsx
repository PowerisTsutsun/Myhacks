"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations";
import type { SignupFormData } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function SignupForm({ redirectTo = "/register" }: { redirectTo?: string }) {
  const [done, setDone] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
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
      setSubmittedEmail(data.email);
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-5">📧</div>
        <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-2">
          We sent a verification link to{" "}
          <span className="text-laser-400 font-medium">{submittedEmail}</span>.
        </p>
        <p className="text-white/40 text-sm mb-6">
          Click the link to activate your account, then log in.
        </p>
        <Link
          href={`/login${redirectTo !== "/register" ? `?next=${encodeURIComponent(redirectTo)}` : ""}`}
          className="text-sm text-laser-400 hover:text-laser-300 transition-colors"
        >
          Go to log in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
