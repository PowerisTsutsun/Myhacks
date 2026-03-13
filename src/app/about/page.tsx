import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";

const VALUES = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: "Build",
    desc: "Create something real — from zero to a working prototype in 24 hours.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: "Learn",
    desc: "Workshops, mentors, and hands-on experience you won't get in a classroom.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "Connect",
    desc: "Meet students, mentors, alumni, and industry professionals in your community.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: "Create",
    desc: "Express yourself through technology — the medium is yours to choose.",
  },
];

export const metadata: Metadata = {
  title: "About",
  description: "Learn about LaserHacks — IVC's beginner-friendly annual hackathon.",
};

function PinIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">About</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">What is LaserHacks?</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto text-balance">
              A hackathon built for every student — regardless of experience, background, or major.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-16">
          {/* Mission */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              LaserHacks was founded to make the hackathon experience accessible to every student at
              Irvine Valley College. We believe the best ideas come from diverse teams, and that
              coding experience should never be a barrier to entry.
            </p>
            <p className="text-white/60 leading-relaxed">
              Whether you&apos;re a computer science student or a visual arts major, whether you&apos;ve written
              thousands of lines of code or none at all — LaserHacks is for you.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="flex gap-4 p-5 rounded-2xl group transition-all duration-200"
                  style={{ background: "rgba(8,20,37,0.6)", border: "1px solid rgba(75,159,229,0.12)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-laser-400 transition-colors duration-200" style={{ background: "rgba(75,159,229,0.1)", border: "1px solid rgba(75,159,229,0.2)" }}>
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{v.title}</h3>
                    <p className="text-white/50 text-sm">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who can participate */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Who Can Participate?</h2>
            <ul className="space-y-3 text-white/60">
              {[
                "Current Irvine Valley College students (any major)",
                "Community college students from partner institutions",
                "Students who have never coded before are especially welcome",
                "Teams of 1–4 people (solo participation allowed)",
                "High school students with a supervising mentor (check current rules)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-laser-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Beginner emphasis */}
          <section
            className="rounded-2xl p-8"
            style={{ background: "rgba(21,88,160,0.15)", border: "1px solid rgba(75,159,229,0.2)" }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">You don&apos;t need to know how to code.</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Seriously. LaserHacks is designed for beginners first. We run workshops at the start of
              the event, pair teams with mentors, and encourage projects at any technical level. A
              beautifully designed poster, a thoughtful wireframe, a simple website — all valid submissions.
            </p>
            <p className="text-white/60 leading-relaxed">
              Many of our past participants had never built anything before LaserHacks. Many went on
              to study computer science, land internships, and build startups. It starts here.
            </p>
          </section>

          {/* Hosted by */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Hosted by IVC</h2>
            <p className="text-white/60 leading-relaxed">
              LaserHacks is organized by the Associated Students of Irvine Valley College (ASIVC)
              and volunteer student organizers. We partner with the IVC Computer Science department,
              local tech companies, and alumni to make the event possible.
            </p>
            {config.contact_email && (
              <p className="mt-3 text-white/60">
                Questions? Email us at{" "}
                <a href={`mailto:${config.contact_email}`} className="text-laser-400 underline hover:text-laser-300">
                  {config.contact_email}
                </a>
              </p>
            )}
          </section>

          {/* Location + Map */}
          {(config.venue_name || config.venue_address) && (() => {
            const address = config.venue_address || config.venue_name || "";
            const encoded = encodeURIComponent(address);
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
            const appleMapsUrl = `https://maps.apple.com/?q=${encoded}`;
            const embedUrl = "https://www.openstreetmap.org/export/embed.html?bbox=-117.791%2C33.667%2C-117.767%2C33.682&layer=mapnik&marker=33.67457%2C-117.77906";
            return (
              <section>
                <h2 className="text-2xl font-bold text-white mb-2">Location</h2>
                {config.venue_name && <p className="text-white/70 font-medium">{config.venue_name}</p>}
                {config.venue_address && <p className="text-white/40 text-sm mb-5">{config.venue_address}</p>}

                <div
                  className="rounded-2xl overflow-hidden mb-4"
                  style={{ border: "1px solid rgba(75,159,229,0.2)" }}
                >
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="320"
                    style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg) saturate(0.8)" }}
                    loading="lazy"
                    title="Event location map"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <PinIcon />
                    Open in Google Maps
                  </a>
                  <a
                    href={appleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <PinIcon />
                    Open in Apple Maps
                  </a>
                </div>
              </section>
            );
          })()}
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}
