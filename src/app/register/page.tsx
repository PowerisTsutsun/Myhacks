import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for MyHacks — a beginner-friendly hackathon.",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/register");
  }

  const config = await getSiteConfig();
  const isExternal = config.registration_mode === "external";

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Header */}
        <div
          className="py-20 sm:py-28 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, #1a3a6e 0%, #0d1b2a 60%, #050d1a 100%)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Register</p>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Join {config.event_name}
            </h1>
            <p className="text-white/55 text-lg">
              Registration is free and open to all students.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {isExternal ? (
            <ExternalRegistration config={config} />
          ) : (
            <div
              className="rounded-3xl p-8 sm:p-10"
              style={{
                background: "rgba(13,27,42,0.85)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 0 1px rgba(56,189,248,0.12), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <RegisterForm eventName={config.event_name} />
            </div>
          )}
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

function ExternalRegistration({
  config,
}: {
  config: { event_name: string; external_registration_url: string | null; contact_email: string | null };
}) {
  return (
    <div
      className="text-center py-10 rounded-3xl px-8"
      style={{
        background: "rgba(13,27,42,0.85)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 0 0 1px rgba(56,189,248,0.12), 0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div className="text-5xl mb-5" role="img" aria-label="Register">📝</div>
      <h2 className="text-2xl font-bold text-white mb-3">
        Registration is open!
      </h2>
      <p className="text-white/55 mb-6 max-w-md mx-auto">
        Click below to register for {config.event_name}. Registration is free and only takes a few
        minutes.
      </p>

      {config.external_registration_url ? (
        <Button asChild size="lg" variant="primary">
          <a href={config.external_registration_url} target="_blank" rel="noopener noreferrer">
            Register Now →
          </a>
        </Button>
      ) : (
        <div
          className="p-6 rounded-2xl text-white/65 text-sm"
          style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.1)" }}
        >
          Registration link coming soon. Check back later or{" "}
          {config.contact_email ? (
            <a href={`mailto:${config.contact_email}`} className="text-laser-400 underline">
              contact us
            </a>
          ) : (
            "visit our contact page"
          )}{" "}
          for updates.
        </div>
      )}
    </div>
  );
}
