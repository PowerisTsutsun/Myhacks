import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "image/png") {
    return NextResponse.json({ error: "Only PNG files are allowed." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 2 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Verify PNG magic bytes: 89 50 4E 47
  if (
    buffer[0] !== 0x89 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x4e ||
    buffer[3] !== 0x47
  ) {
    return NextResponse.json({ error: "File is not a valid PNG." }, { status: 400 });
  }

  const filename = `${randomUUID()}.png`;
  const dest = join(process.cwd(), "public", "sponsors", filename);

  try {
    await writeFile(dest, buffer);
  } catch {
    return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
  }

  return NextResponse.json({ url: `/sponsors/${filename}` }, { status: 201 });
}
