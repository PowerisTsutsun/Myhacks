/**
 * Seeds the database with realistic sample data for LaserHacks.
 * Usage: npm run seed
 *
 * This will insert sample data. Existing records are not deleted.
 * Safe to re-run — checks for existing data.
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { count, eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL must be set in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seedSettings() {
  const settings = [
    { key: "event_name", value: "LaserHacks" },
    { key: "tagline", value: "IVC's beginner-friendly annual student hackathon" },
    { key: "event_start", value: "2025-10-10" },
    { key: "event_end", value: "2025-10-12" },
    { key: "venue_name", value: "Irvine Valley College" },
    { key: "venue_address", value: "5500 Irvine Center Dr, Irvine, CA 92618" },
    { key: "registration_mode", value: "external" },
    { key: "external_registration_url", value: "" },
    { key: "contact_email", value: "contact@laserhacks.org" },
  ];

  for (const s of settings) {
    const existing = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.key, s.key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(schema.siteSettings).values(s);
    }
  }
  console.log("✅  Site settings seeded");
}

async function seedFaq() {
  const [{ total }] = await db.select({ total: count() }).from(schema.faqItems);
  if (total > 0) { console.log("ℹ️   FAQ items already exist, skipping"); return; }

  const faqs = [
    { question: "Who can participate in LaserHacks?", answer: "LaserHacks is open to all currently enrolled students at Irvine Valley College. Students from partner community colleges may also participate — check the current rules for details.", category: "general", sortOrder: 0 },
    { question: "Do I need coding experience to participate?", answer: "Absolutely not! LaserHacks is designed to be beginner-friendly. We run introductory workshops at the start of the event, and mentors are available throughout to help teams of all skill levels.", category: "general", sortOrder: 1 },
    { question: "Is there a registration fee?", answer: "No! LaserHacks is completely free to attend for registered students. We provide meals, snacks, and swag throughout the event.", category: "general", sortOrder: 2 },
    { question: "How big can my team be?", answer: "Teams can be 1 to 4 people. You can form a team before the event or find teammates at our team-formation session at the start of LaserHacks. Solo participation is also welcome.", category: "teams", sortOrder: 3 },
    { question: "Can I work on a project I already started?", answer: "No — all projects must be started from scratch at LaserHacks. You can brainstorm ideas in advance and bring design mockups or sketches, but no code or working prototypes before the event starts.", category: "general", sortOrder: 4 },
    { question: "What should I bring?", answer: "Your laptop and charger, any hardware you plan to use, and a valid student ID. We'll provide food, drinks, and a comfortable hacking environment.", category: "logistics", sortOrder: 5 },
    { question: "Is the event overnight?", answer: "LaserHacks typically spans a Friday evening through Sunday afternoon. The venue may close overnight depending on the year — check the current event details closer to the date.", category: "logistics", sortOrder: 6 },
    { question: "What kinds of projects can I build?", answer: "Anything! Web apps, mobile apps, hardware projects, games, design projects, social impact tools — as long as it's something you built at the event. Judges evaluate based on creativity, impact, execution, and presentation.", category: "projects", sortOrder: 7 },
    { question: "How does judging work?", answer: "At the end of the hacking period, teams demo their projects to a panel of judges. Projects are evaluated on creativity, technical difficulty, practical impact, and presentation. Prizes are awarded across multiple categories.", category: "judging", sortOrder: 8 },
    { question: "Are there prizes?", answer: "Yes! We award prizes across multiple tracks including Best Overall, Best Beginner Project, Most Creative, Best Social Impact, and more. Prizes include tech gear, gift cards, and opportunities to connect with sponsors.", category: "judging", sortOrder: 9 },
    { question: "Will there be food?", answer: "Yes — all meals and snacks are provided throughout the event for registered participants. Please indicate any dietary restrictions during registration and we'll do our best to accommodate.", category: "logistics", sortOrder: 10 },
    { question: "How can I get mentorship?", answer: "Industry mentors and upperclassmen volunteers are available throughout the event. You can approach any mentor directly or sign up for dedicated mentor sessions during the event.", category: "general", sortOrder: 11 },
  ];

  await db.insert(schema.faqItems).values(faqs.map((f) => ({ ...f, isPublished: true })));
  console.log("✅  FAQ items seeded");
}

async function seedSchedule() {
  const [{ total }] = await db.select({ total: count() }).from(schema.scheduleDays);
  if (total > 0) { console.log("ℹ️   Schedule already exists, skipping"); return; }

  const [day1] = await db.insert(schema.scheduleDays).values({ label: "Friday — Kickoff", date: "October 10, 2025", sortOrder: 0 }).returning();
  const [day2] = await db.insert(schema.scheduleDays).values({ label: "Saturday — Hacking Day", date: "October 11, 2025", sortOrder: 1 }).returning();
  const [day3] = await db.insert(schema.scheduleDays).values({ label: "Sunday — Demo Day", date: "October 12, 2025", sortOrder: 2 }).returning();

  await db.insert(schema.scheduleItems).values([
    { dayId: day1.id, time: "4:00 PM", title: "Check-in & Registration", location: "Main Lobby", sortOrder: 0 },
    { dayId: day1.id, time: "5:00 PM", title: "Opening Ceremony", description: "Welcome remarks, schedule overview, and sponsor intros.", isImportant: true, location: "Auditorium", sortOrder: 1 },
    { dayId: day1.id, time: "6:00 PM", title: "Team Formation & Mixer", description: "Find your team! We'll help connect solo participants.", location: "Commons Area", sortOrder: 2 },
    { dayId: day1.id, time: "7:00 PM", title: "Intro to Web Dev Workshop", description: "Beginner-friendly workshop on HTML, CSS, and JavaScript basics.", track: "Workshop", location: "Room 101", sortOrder: 3 },
    { dayId: day1.id, time: "8:00 PM", title: "Hacking Begins!", description: "Start building! Mentors are available.", isImportant: true, sortOrder: 4 },

    { dayId: day2.id, time: "9:00 AM", title: "Breakfast", location: "Commons Area", sortOrder: 0 },
    { dayId: day2.id, time: "10:00 AM", title: "Intro to APIs Workshop", description: "Learn how to use public APIs to supercharge your project.", track: "Workshop", location: "Room 101", sortOrder: 1 },
    { dayId: day2.id, time: "12:00 PM", title: "Lunch", location: "Commons Area", sortOrder: 2 },
    { dayId: day2.id, time: "2:00 PM", title: "UI/UX Design Workshop", description: "Design thinking and rapid prototyping with Figma.", track: "Workshop", location: "Room 102", sortOrder: 3 },
    { dayId: day2.id, time: "4:00 PM", title: "Mentor Office Hours", description: "Sign up to chat with industry mentors for 15 minutes.", track: "Mentors", location: "Room 103", sortOrder: 4 },
    { dayId: day2.id, time: "6:00 PM", title: "Dinner", location: "Commons Area", sortOrder: 5 },
    { dayId: day2.id, time: "11:59 PM", title: "Submissions Due", description: "Submit your project on Devpost before midnight!", isImportant: true, sortOrder: 6 },

    { dayId: day3.id, time: "9:00 AM", title: "Breakfast & Prep Time", location: "Commons Area", sortOrder: 0 },
    { dayId: day3.id, time: "10:00 AM", title: "Project Demos", description: "Demo your project to judges and fellow participants.", isImportant: true, location: "Demo Hall", track: "Judging", sortOrder: 1 },
    { dayId: day3.id, time: "12:00 PM", title: "Lunch", location: "Commons Area", sortOrder: 2 },
    { dayId: day3.id, time: "1:00 PM", title: "Awards Ceremony", description: "Winners announced across all tracks. Prizes awarded.", isImportant: true, location: "Auditorium", sortOrder: 3 },
    { dayId: day3.id, time: "2:00 PM", title: "Closing & Farewell", location: "Auditorium", sortOrder: 4 },
  ]);

  console.log("✅  Schedule seeded");
}

async function seedAnnouncements() {
  const [{ total }] = await db.select({ total: count() }).from(schema.announcements);
  if (total > 0) { console.log("ℹ️   Announcements already exist, skipping"); return; }

  await db.insert(schema.announcements).values([
    {
      title: "LaserHacks 2025 Registration is Open!",
      slug: "laserhacks-2025-registration-open",
      body: "We're thrilled to announce that registration for LaserHacks 2025 is now open! Join us October 10–12 at Irvine Valley College for a weekend of building, learning, and connecting. Registration is completely free for IVC students.",
      isPublished: true,
      publishedAt: new Date("2025-08-01"),
    },
    {
      title: "Mentors Announced",
      slug: "mentors-2025",
      body: "We're excited to share our lineup of mentors for LaserHacks 2025! Industry professionals from local tech companies will be available throughout the event to help your team with technical questions, product direction, and career advice.",
      isPublished: true,
      publishedAt: new Date("2025-09-01"),
    },
    {
      title: "Workshop Schedule Released",
      slug: "workshop-schedule-2025",
      body: "The full workshop schedule for LaserHacks 2025 is now available. We'll have beginner-friendly sessions on web development, APIs, UI/UX design, and more. No prior experience needed!",
      isPublished: true,
      publishedAt: new Date("2025-09-15"),
    },
  ]);
  console.log("✅  Announcements seeded");
}

async function seedSponsors() {
  const [{ total }] = await db.select({ total: count() }).from(schema.sponsors);
  if (total > 0) { console.log("ℹ️   Sponsors already exist, skipping"); return; }

  await db.insert(schema.sponsors).values([
    { name: "ASIVC", tier: "platinum", description: "Associated Students of Irvine Valley College", sortOrder: 0, isPublished: true },
    { name: "IVC Computer Science Dept.", tier: "gold", description: "Department of Computer Science & Information Technology", sortOrder: 1, isPublished: true },
    { name: "Tech Sponsor (Coming Soon)", tier: "silver", description: "Interested in sponsoring? Contact us!", sortOrder: 2, isPublished: false },
    { name: "Community Sponsor Slot", tier: "community", sortOrder: 3, isPublished: false },
  ]);
  console.log("✅  Sponsors seeded");
}

async function main() {
  console.log("🌱 Seeding LaserHacks database...\n");

  await seedSettings();
  await seedFaq();
  await seedSchedule();
  await seedAnnouncements();
  await seedSponsors();

  console.log("\n✨ Seed complete!");
  console.log("   Run `npm run create-admin` to create your admin account.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
