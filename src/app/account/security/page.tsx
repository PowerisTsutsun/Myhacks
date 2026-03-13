import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { SecuritySettings } from "@/components/account/SecuritySettings";

export const metadata: Metadata = {
  title: "Account Security",
  description: "Manage two-factor authentication and account security settings.",
};

export default async function AccountSecurityPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/account/security");
  }

  const [user] = await db
    .select({
      role: users.role,
      twoFactorEnabled: users.twoFactorEnabled,
      totpEnabled: users.totpEnabled,
      twoFactorMethod: users.twoFactorMethod,
    })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);

  const config = await getSiteConfig();

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Header */}
        <div className="py-12 sm:py-16 relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(10,24,48,0.98) 0%, rgba(6,17,31,0.92) 100%)", borderBottom: "1px solid rgba(49,84,135,0.3)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(77,163,255,0.18) 0%, transparent 70%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-laser-400 font-semibold text-xs uppercase tracking-widest mb-2">Account</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Security Settings</h1>
            <p className="text-white/55 mt-2">
              Manage two-factor authentication for your account.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <SecuritySettings
            allowEmailTwoFactor={user?.role !== "admin"}
            emailTwoFactorEnabled={user?.twoFactorEnabled ?? false}
            totpEnabled={user?.totpEnabled ?? false}
            twoFactorMethod={user?.twoFactorMethod ?? "email"}
          />
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}
