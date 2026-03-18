import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ContactClient } from "./ContactClient";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const rows = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));

  return <ContactClient initialMessages={rows} />;
}
