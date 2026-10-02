import { prisma } from "@/app/lib/prisma";
import { CDN_BASE } from "@/app/lib/storage";

// Keeping DB references in sync with the Spaces file manager.
//
// The Files tab can rename/delete objects directly in the bucket. Those objects
// are also referenced by URL from several tables (a gallery's photos, a video's
// thumbnail, etc.). Moving/removing the object without touching the DB orphans
// those rows — the object 404s (Spaces actually returns 403 to anonymous
// callers), so the photo/video silently breaks on the site. These helpers
// rewrite or drop the matching rows in the same request as the bucket change.

// Every column that may store a Spaces object URL. Identifiers are hardcoded
// here (never user input) so they're safe to interpolate into raw SQL.
const URL_COLUMNS: ReadonlyArray<readonly [table: string, column: string]> = [
  ["Image", "path"],
  ["Gallery", "coverImage"],
  ["SocialVideo", "sourceUrl"],
  ["SocialVideo", "thumbnailUrl"],
  ["VideoProject", "videoUrl"],
  ["VideoProject", "thumbnailUrl"],
  ["Blog", "content"], // embedded image URLs in post bodies
];

// Encode a key for use in a URL: percent-encode each segment but keep slashes.
// Matches what a browser needs for keys containing spaces/special chars.
function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

// The URL form(s) a given key may be stored as: the raw (legacy, unencoded)
// form that storage.keyToUrl produced, and the %-encoded form. They're equal
// for keys without special chars, so we de-dupe.
function urlForms(key: string): string[] {
  const raw = `${CDN_BASE}/${key}`;
  const enc = `${CDN_BASE}/${encodeKey(key)}`;
  return raw === enc ? [raw] : [raw, enc];
}

// Rewrite every DB reference to objects at/under `oldKey` so it points at
// `newKey`. Pass folder prefixes with a trailing slash (so "galleries/art/"
// doesn't also match "galleries/artsy1/"), or a full object key for a single
// file. Always writes the %-encoded form (browser-safe). Returns rows changed.
export async function rewriteSpacesUrlRefs(oldKey: string, newKey: string): Promise<number> {
  if (!CDN_BASE || !oldKey || oldKey === newKey) return 0;
  const newUrl = `${CDN_BASE}/${encodeKey(newKey)}`;
  let changed = 0;
  for (const [table, col] of URL_COLUMNS) {
    for (const oldUrl of urlForms(oldKey)) {
      // strpos (not LIKE) — URLs contain % in encoded form, which LIKE would
      // treat as a wildcard. strpos matches the literal substring.
      const sql =
        `UPDATE "${table}" SET "${col}" = replace("${col}", $1, $2) ` +
        `WHERE strpos("${col}", $1) > 0`;
      changed += await prisma.$executeRawUnsafe(sql, oldUrl, newUrl);
    }
  }
  return changed;
}

// Drop DB references to objects at/under `key` after they've been deleted from
// the bucket. Orphaned gallery photos are removed; a gallery/video whose
// cover/thumbnail was deleted has it cleared. Required URL columns (a video's
// own source) are left alone — there's no safe automatic action there.
export async function removeSpacesUrlRefs(key: string): Promise<void> {
  if (!CDN_BASE || !key) return;
  for (const url of urlForms(key)) {
    await prisma.$executeRawUnsafe(`DELETE FROM "Image" WHERE strpos("path", $1) > 0`, url);
    await prisma.$executeRawUnsafe(
      `UPDATE "Gallery" SET "coverImage" = NULL WHERE strpos("coverImage", $1) > 0`,
      url
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "SocialVideo" SET "thumbnailUrl" = NULL WHERE strpos("thumbnailUrl", $1) > 0`,
      url
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "VideoProject" SET "thumbnailUrl" = NULL WHERE strpos("thumbnailUrl", $1) > 0`,
      url
    );
  }
}
