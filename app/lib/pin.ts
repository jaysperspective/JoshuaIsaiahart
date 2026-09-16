import { createHash } from "crypto";

// Cookie token for PIN-protected galleries. Knowing the PIN is the secret;
// the hash just keeps the raw PIN out of the cookie jar.
export function pinToken(galleryId: string, pin: string): string {
  return createHash("sha256").update(`${galleryId}:${pin}:jia-gallery`).digest("hex");
}

export function pinCookieName(galleryId: string): string {
  return `gpin_${galleryId}`;
}
