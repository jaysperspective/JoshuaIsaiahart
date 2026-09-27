import { prisma } from "@/app/lib/prisma";

/**
 * Single source of truth for the digital business card (/card) and the
 * downloadable vCard (/api/vcard). Static details live here; Instagram /
 * LinkedIn / YouTube are pulled from the admin Settings record when present,
 * falling back to the constants below.
 *
 * To hard-code socials (e.g. if the Settings table isn't migrated yet), just
 * fill in the FALLBACK_* values.
 */

export const SITE_URL = "https://joshuaisaiah.art";

// Identity
export const CARD = {
  name: "Joshua Isaiah",
  firstName: "Joshua",
  lastName: "Isaiah",
  title: "Creative Director",
  tagline: "Photographer & Filmmaker",
  org: "Joshua Isaiah — Photography & Film",
  location: "Washington, DC Metro Area",
  // Featured contact points
  email: "joshualharrington@gmail.com",
  // E.164 for tel:/sms: links, plus a human-readable version
  phone: "+14344893932",
  phoneDisplay: "(434) 489-3932",
  portfolio: SITE_URL,
  bookUrl: `${SITE_URL}/work#book`,
} as const;

// Fallbacks used when the admin Settings record is empty / unavailable.
// Paste full URLs (https://…) or leave blank to hide that button.
const FALLBACK_INSTAGRAM = "https://instagram.com/fototrophic";
const FALLBACK_LINKEDIN = "https://www.linkedin.com/in/jharringtonphoto/";
const FALLBACK_YOUTUBE = "";

export interface CardSocials {
  instagram: string;
  linkedin: string;
  youtube: string;
}

/** Read socials from the Settings record, falling back to constants above. */
export async function getSocials(): Promise<CardSocials> {
  try {
    const s = await (prisma as any).settings.findFirst();
    return {
      instagram: s?.instagramUrl || FALLBACK_INSTAGRAM,
      linkedin: s?.linkedinUrl || FALLBACK_LINKEDIN,
      youtube: s?.youtubeUrl || FALLBACK_YOUTUBE,
    };
  } catch {
    return {
      instagram: FALLBACK_INSTAGRAM,
      linkedin: FALLBACK_LINKEDIN,
      youtube: FALLBACK_YOUTUBE,
    };
  }
}
