/**
 * Creates or updates the admin user from environment variables.
 * Usage: npm run create-admin
 *
 * Required env vars (in .env.local):
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 *   SEED_ADMIN_NAME
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name = process.env.SEED_ADMIN_NAME || "MyHacks Admin";

if (!email || !password) {
  console.error("❌  SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL must be set in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  const passwordHash = await bcrypt.hash(password!, 12);

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email!.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.users)
      .set({ passwordHash, name, updatedAt: new Date() })
      .where(eq(schema.users.email, email!.toLowerCase()));
    console.log(`✅  Updated admin: ${email}`);
  } else {
    await db.insert(schema.users).values({
      email: email!.toLowerCase(),
      passwordHash,
      name,
      role: "admin",
    });
    console.log(`✅  Created admin: ${email}`);
  }

  console.log("   You can now log in at /admin/login");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
