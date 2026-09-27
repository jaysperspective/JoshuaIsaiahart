import { CARD, getSocials, SITE_URL } from "@/app/lib/contact";

export const dynamic = "force-dynamic";

// vCard 3.0 — broadly compatible with iOS/Android/macOS contacts.
function esc(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function GET() {
  const socials = await getSocials();

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(CARD.lastName)};${esc(CARD.firstName)};;;`,
    `FN:${esc(CARD.name)}`,
    `ORG:${esc(CARD.org)}`,
    `TITLE:${esc(`${CARD.title} · ${CARD.tagline}`)}`,
    `TEL;TYPE=CELL,VOICE:${CARD.phone}`,
    `EMAIL;TYPE=INTERNET,PREF:${CARD.email}`,
    `URL:${SITE_URL}`,
    `ADR;TYPE=WORK:;;;Washington;DC;;US`,
  ];

  if (socials.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${socials.instagram}`);
  if (socials.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${socials.linkedin}`);
  if (socials.youtube) lines.push(`X-SOCIALPROFILE;TYPE=youtube:${socials.youtube}`);

  lines.push(`NOTE:${esc("Creative Director, photographer & filmmaker — Washington, DC metro.")}`);
  lines.push("END:VCARD");

  const body = lines.join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="joshua-isaiah.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
