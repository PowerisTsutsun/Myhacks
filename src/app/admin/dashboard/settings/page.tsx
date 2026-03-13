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
      emailNotifications: users.emailNotifications,
    })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);

  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="mt-1 text-sm text-semantic-text-muted">
            Manage your admin password, two-factor authentication, and notifications.
          </p>
        </div>
        <SettingsClient user={user} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">
          Configure event details, registration mode, and social links.
        </p>
      </div>
      <SettingsForm initialValues={config} />
    </div>
  );
}
