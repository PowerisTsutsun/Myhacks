import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSiteConfig } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SettingsClient } from "@/app/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const config = await getSiteConfig();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      twoFactorEnabled: users.twoFactorEnabled,
      totpEnabled: users.totpEnabled,
      twoFactorMethod: users.twoFactorMethod,
      emailNotifications: users.emailNotifications,
    })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);

  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-sm text-semantic-text-muted">
          Separate controls for your admin account and the public event configuration.
        </p>
      </div>

      <section
        className="rounded-3xl border p-6 md:p-8"
        style={{
          background: "linear-gradient(180deg, rgba(8,10,10,0.98) 0%, rgba(12,16,14,0.96) 100%)",
          borderColor: "rgba(52,211,153,0.18)",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.42)",
        }}
      >
        <div className="mb-6 border-b pb-4" style={{ borderColor: "rgba(52,211,153,0.14)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Admin Settings
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Your account and security</h2>
          <p className="mt-1 text-sm text-semantic-text-muted">
            Manage your admin password, two-factor authentication, and notification preferences.
          </p>
        </div>
        <SettingsClient user={user} />
      </section>

      <section
        className="rounded-3xl border p-6 md:p-8"
        style={{
          background: "linear-gradient(180deg, rgba(8,10,10,0.98) 0%, rgba(12,16,14,0.96) 100%)",
          borderColor: "rgba(52,211,153,0.18)",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.42)",
        }}
      >
        <div className="mb-6 border-b pb-4" style={{ borderColor: "rgba(52,211,153,0.14)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Site Settings
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">Event configuration</h2>
          <p className="mt-1 text-sm text-semantic-text-muted">
            Configure event details, registration mode, sponsor links, and public contact info.
          </p>
        </div>
        <SettingsForm initialValues={config} />
      </section>
    </div>
  );
}
