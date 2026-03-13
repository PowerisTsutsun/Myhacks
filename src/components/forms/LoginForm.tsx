"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({ redirectTo = "/register" }: { redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setNeedsVerification(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "verify_email") {
          setNeedsVerification(true);
          return;
        }
        setError(json.error || "Login failed. Please check your credentials.");
        return;
      }

      // Step 2: redirect to 2FA page, carrying the method so the page shows the right hint
      if (json.requires2FA) {
        const methodParam = json.method ? `&method=${json.method}` : "";
        router.push(`/login/2fa?next=${encodeURIComponent(redirectTo)}${methodParam}`);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  if (needsVerification) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">📧</div>
        <p className="text-white font-semibold mb-2">Email not verified</p>
        <p className="text-white/50 text-sm mb-6">
          Please verify your email before logging in.
        </p>
        <Link
          href="/verify-email/resend"
          className="inline-block bg-laser-500 hover:bg-laser-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Resend verification email
        </Link>
        <button
          onClick={() => setNeedsVerification(false)}
          className="block mx-auto mt-4 text-sm text-white/30 hover:text-white/50 transition-colors"
        >
          ← Back
        </button>
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

      <Input dark label="Email" type="email" required autoComplete="email"
        error={errors.email?.message} {...register("email")} />

      <Input dark label="Password" type="password" required autoComplete="current-password"
        error={errors.password?.message} {...register("password")} />

      <div className="text-right">
        <Link href="/forgot-password" className="text-xs text-white/30 hover:text-laser-400 transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full justify-center">
        Sign In
      </Button>
    </form>
  );
}
