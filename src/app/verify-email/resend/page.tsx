"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export default function ResendVerificationPage() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      setServerError(json.error ?? "Failed. Please try again.");
      return;
    }
    setDone(true);
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
        {done ? (
          <div className="text-center">
            <div className="text-5xl mb-5">📨</div>
            <h1 className="text-2xl font-bold text-white mb-3">Email sent!</h1>
            <p className="text-white/60 mb-6">
              If that email has an account that isn&apos;t verified yet, we sent a new link.
              Check your inbox.
            </p>
            <Link href="/login" className="text-laser-400 hover:text-laser-300 text-sm transition-colors">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
                Email Verification
              </p>
              <h1 className="text-2xl font-bold text-white">Resend verification</h1>
              <p className="text-white/55 text-sm mt-2">
                Enter your email and we&apos;ll send a new verification link.
              </p>
            </div>

            {serverError && (
              <div className="mb-4 p-3 rounded-lg text-sm text-red-300 border border-red-500/30"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input dark label="Email" type="email" required
                error={errors.email?.message} {...register("email")} />
              <Button type="submit" loading={isSubmitting} className="w-full justify-center">
                Send verification email
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/30">
              <Link href="/login" className="text-laser-400 hover:text-laser-300 transition-colors">
                Back to log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
