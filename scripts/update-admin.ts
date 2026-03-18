import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const result = await db.update(schema.users)
    .set({ name: "Admin" })
    .where(eq(schema.users.email, "admin@laserhack.org"))
    .returning({ id: schema.users.id, name: schema.users.name, email: schema.users.email });
  console.log("Updated admin:", JSON.stringify(result));

  await db.update(schema.siteSettings).set({ value: "MyHacks" }).where(eq(schema.siteSettings.key, "event_name"));
  await db.update(schema.siteSettings).set({ value: "" }).where(eq(schema.siteSettings.key, "venue_name"));
  await db.update(schema.siteSettings).set({ value: "" }).where(eq(schema.siteSettings.key, "venue_address"));
  await db.update(schema.siteSettings).set({ value: "" }).where(eq(schema.siteSettings.key, "contact_email"));
  await db.update(schema.siteSettings).set({ value: "A beginner-friendly hackathon for everyone" }).where(eq(schema.siteSettings.key, "tagline"));
  console.log("All settings updated");

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
