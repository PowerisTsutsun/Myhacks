import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/settings");

  const config = await getSiteConfig();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      twoFactorEnabled: users.twoFactorEnabled,
      totpEnabled: users.totpEnabled,
      twoFactorMethod: users.twoFactorMethod,
      emailNotifications: users.emailNotifications,
    })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);

  if (!user) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {/* Header */}
          <div className="mb-10">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">Account</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
            <p className="text-white/50 mt-2">Manage your password, security, and notifications.</p>
          </div>

          <SettingsClient user={user} allowEmailTwoFactor={user.role !== "admin"} />
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}
