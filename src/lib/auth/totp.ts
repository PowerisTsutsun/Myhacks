// otplib v13 uses named exports — no `authenticator` object like v12
import { generateSecret as otplibGenerateSecret, generateURI, verify as otplibVerify } from "otplib";
import QRCode from "qrcode";

const ISSUER = "LaserHacks";

/** Generate a new Base32-encoded TOTP secret. */
export function generateTotpSecret(): string {
  return otplibGenerateSecret();
}

/**
 * Build the otpauth:// URI that authenticator apps consume.
 * `label` should be the user's email address.
 */
export function generateTotpUri(label: string, secret: string): string {
  return generateURI({ label, secret, issuer: ISSUER });
}

/**
 * Render the otpauth URI as a base64 PNG data URL for display in an <img>.
 */
export async function generateTotpQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    width: 240,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Verify a 6-digit TOTP code against a secret.
 * otplib v13 allows a ±1 window (30 s tolerance) by default.
 * Returns false on any error.
 */
export async function verifyTotpCode(code: string, secret: string): Promise<boolean> {
  try {
    const result = await otplibVerify({ token: code, secret });
    return result.valid;
  } catch {
    return false;
  }
}
