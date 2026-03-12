import crypto from "crypto";

/** Generate a URL-safe random hex token (32 bytes = 64 chars). */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Generate a 6-digit numeric 2FA code. */
export function generate2FACode(): string {
  const num = crypto.randomInt(0, 1_000_000);
  return num.toString().padStart(6, "0");
}

/** Hash a token or code with SHA-256 for safe DB storage. */
export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Returns a Date that is `minutes` from now. */
export function expiresInMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
