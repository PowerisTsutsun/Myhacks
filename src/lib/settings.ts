import { unstable_noStore as noStore } from "next/cache";
import { db } from "./db";
import { siteSettings } from "./db/schema";

export type SiteConfig = {
  event_name: string;
  tagline: string;
  event_start: string | null;
  event_end: string | null;
  venue_name: string | null;
  venue_address: string | null;
  registration_mode: "internal" | "external";
  external_registration_url: string | null;
  sponsor_packet_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  contact_email: string | null;
};

const DEFAULTS: SiteConfig = {
  event_name: "LaserHacks",
  tagline: "IVC's beginner-friendly annual hackathon",
  event_start: null,
  event_end: null,
  venue_name: "Irvine Valley College",
  venue_address: "5500 Irvine Center Dr, Irvine, CA 92618",
  registration_mode: "external",
  external_registration_url: null,
  sponsor_packet_url: null,
  instagram_url: null,
  twitter_url: null,
  linkedin_url: null,
  contact_email: "contact@laserhack.org",
};

export async function getSiteConfig(): Promise<SiteConfig> {
  noStore();
  try {
    const rows = await db.select().from(siteSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
    return {
      event_name: map["event_name"] || DEFAULTS.event_name,
      tagline: map["tagline"] || DEFAULTS.tagline,
      event_start: map["event_start"] || null,
      event_end: map["event_end"] || null,
      venue_name: map["venue_name"] || null,
      venue_address: map["venue_address"] || null,
      registration_mode: (map["registration_mode"] as "internal" | "external") || DEFAULTS.registration_mode,
      external_registration_url: map["external_registration_url"] || null,
      sponsor_packet_url: map["sponsor_packet_url"] || null,
      instagram_url: map["instagram_url"] || null,
      twitter_url: map["twitter_url"] || null,
      linkedin_url: map["linkedin_url"] || null,
      contact_email: map["contact_email"] || DEFAULTS.contact_email,
    };
  } catch {
    return DEFAULTS;
  }
}
