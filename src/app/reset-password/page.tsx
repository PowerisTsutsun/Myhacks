"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const schema = z.object({
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Failed. The link may have expired.");
      return;
    }
    router.push("/login?reset=1");
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-white/60">
          <p>Invalid reset link.</p>
          <Link href="/forgot-password" className="text-laser-400 text-sm mt-2 inline-block">
            Request a new one
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{
          background: "rgba(8,20,37,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 0 1px rgba(75,159,229,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mb-8 text-center">
          <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
            Account Recovery
          </p>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-300 border border-red-500/30"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input dark label="New Password" type="password" required
            autoComplete="new-password"
            error={errors.password?.message} {...register("password")} />
          <Input dark label="Confirm Password" type="password" required
            autoComplete="new-password"
            error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <Button type="submit" loading={isSubmitting} className="w-full justify-center">
            Reset password
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
