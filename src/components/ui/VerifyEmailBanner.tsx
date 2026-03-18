"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function VerifyEmailBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("verify") === "pending") {
      setVisible(true);
      // Clean the param from the URL without a reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("verify");
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl text-sm"
      style={{
        background: "linear-gradient(135deg, rgba(12,20,14,0.98) 0%, rgba(8,14,10,0.98) 100%)",
        borderColor: "rgba(234,179,8,0.35)",
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
        style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)" }}>
        <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-white/70">
        Check your email to verify your account.
        <span className="text-white/35 ml-1 text-xs">(may take a few minutes)</span>
      </p>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 shrink-0 text-white/25 hover:text-white/60 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
