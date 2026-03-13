import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the LaserHacks team.",
};

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Contact</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-white/60 text-lg">We&apos;d love to hear from you.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <p className="text-white/60 mb-6">
                Have questions about the event, sponsorship, or anything else? Reach out using the
                form or contact us directly.
              </p>

              <div className="space-y-4">
                {config.contact_email && (
                  <ContactItem icon={<EmailIcon />} label="General Inquiries">
                    <a href={`mailto:${config.contact_email}`} className="text-laser-400 underline hover:text-laser-300">
                      {config.contact_email}
                    </a>
                  </ContactItem>
                )}

                {config.venue_name && (
                  <ContactItem icon={<LocationIcon />} label="Location">
                    <span className="text-white/70">{config.venue_name}</span>
                    {config.venue_address && (
                      <span className="block text-white/40 text-sm">{config.venue_address}</span>
                    )}
                  </ContactItem>
                )}

                {(config.instagram_url || config.twitter_url || config.linkedin_url) && (
                  <ContactItem icon={<SocialIcon />} label="Follow Us">
                    <div className="flex gap-3">
                      {config.instagram_url && (
                        <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-laser-400 hover:text-laser-300 underline text-sm">
                          Instagram
                        </a>
                      )}
                      {config.twitter_url && (
                        <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="text-laser-400 hover:text-laser-300 underline text-sm">
                          Twitter
                        </a>
                      )}
                      {config.linkedin_url && (
                        <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-laser-400 hover:text-laser-300 underline text-sm">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </ContactItem>
                )}
              </div>

              <div
                className="mt-8 p-5 rounded-2xl"
                style={{ background: "rgba(21,88,160,0.15)", border: "1px solid rgba(75,159,229,0.2)" }}
              >
                <h3 className="font-semibold text-white mb-1">Sponsorship Inquiries</h3>
                <p className="text-white/60 text-sm">
                  Interested in sponsoring LaserHacks? Use the contact form and select
                  &ldquo;Sponsorship&rdquo; as the subject, or email us directly.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              <ContactForm />
            </div>
          </div>

        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-laser-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <div className="text-white/70">{children}</div>
      </div>
    </div>
  );
}

function EmailIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function LocationIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function SocialIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
}

