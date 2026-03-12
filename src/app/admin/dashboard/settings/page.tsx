import { getSiteConfig } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const config = await getSiteConfig();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Site Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure event details, registration mode, and social links.
        </p>
      </div>
      <SettingsForm initialValues={config} />
    </div>
  );
}
