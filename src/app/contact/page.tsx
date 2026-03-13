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
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(22,98,172,0.38) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Contact</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-white/70 text-lg">We&apos;d love to hear from you.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <p className="text-white/70 mb-6">
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
                    <div className="flex gap-2">
                      {config.instagram_url && (
                        <a
                          href={config.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          title="Instagram"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-laser-400/20 bg-laser-400/10 text-laser-300 transition-colors hover:border-laser-400/40 hover:bg-laser-400/20 hover:text-laser-200"
                        >
                          <InstagramIcon />
                        </a>
                      )}
                      {config.twitter_url && (
                        <a
                          href={config.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter / X"
                          title="Twitter / X"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-laser-400/20 bg-laser-400/10 text-laser-300 transition-colors hover:border-laser-400/40 hover:bg-laser-400/20 hover:text-laser-200"
                        >
                          <TwitterIcon />
                        </a>
                      )}
                      {config.linkedin_url && (
                        <a
                          href={config.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          title="LinkedIn"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-laser-400/20 bg-laser-400/10 text-laser-300 transition-colors hover:border-laser-400/40 hover:bg-laser-400/20 hover:text-laser-200"
                        >
                          <LinkedInIcon />
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
                <p className="text-white/70 text-sm">
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
        <p className="text-xs text-white/55 mb-0.5">{label}</p>
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
function InstagramIcon() {
  return <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function TwitterIcon() {
  return <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.901 3H21l-4.583 5.238L21.807 21h-4.222l-3.307-4.815L10.066 21H7.965l4.902-5.602L7.193 3h4.329l2.99 4.359L18.901 3Zm-.74 16.708h1.167L10.89 4.214H9.64l8.52 15.494Z" /></svg>;
}
function LinkedInIcon() {
  return <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6.94 8.5A1.56 1.56 0 1 0 6.94 5.38a1.56 1.56 0 0 0 0 3.12ZM5.6 9.75h2.68V18H5.6V9.75Zm4.35 0h2.57v1.13h.04c.36-.68 1.23-1.4 2.53-1.4 2.7 0 3.2 1.77 3.2 4.07V18H15.6v-3.97c0-.95-.02-2.17-1.32-2.17-1.32 0-1.52 1.03-1.52 2.1V18H9.95V9.75Z" /></svg>;
}

