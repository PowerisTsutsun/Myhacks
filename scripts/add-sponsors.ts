/**
 * Inserts the confirmed LaserHacks sponsors.
 * Usage: npx tsx scripts/add-sponsors.ts
 *
 * Safe to re-run — existing sponsors with the same name are skipped.
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const SPONSORS: (typeof schema.sponsors.$inferInsert)[] = [
  { name: "Solve CC",              tier: "gold",      sortOrder: 0, isPublished: true },
  { name: "VADEAL PRINT",          tier: "silver",    sortOrder: 1, isPublished: true },
  { name: "MICROPAC TECHNOLOGIES", tier: "gold",      sortOrder: 2, isPublished: true },
  { name: "SPECTRE KEYS",          tier: "silver",    sortOrder: 3, isPublished: true },
  { name: "Boot.Dev",              tier: "bronze",    sortOrder: 4, isPublished: true },
];

async function main() {
  const existing = await db.select({ name: schema.sponsors.name }).from(schema.sponsors);
  const existingNames = new Set(existing.map((r) => r.name));

  const toInsert = SPONSORS.filter((s) => !existingNames.has(s.name));

  if (toInsert.length === 0) {
    console.log("ℹ️  All sponsors already exist, nothing to insert.");
    process.exit(0);
  }

  await db.insert(schema.sponsors).values(toInsert);
  console.log(`✅ Inserted ${toInsert.length} sponsor(s):`);
  toInsert.forEach((s) => console.log(`   • ${s.name} (${s.tier})`));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
