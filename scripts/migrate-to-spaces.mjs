// One-time migration: move existing local uploads (public/galleries, public/reels)
// to DigitalOcean Spaces and rewrite DB paths to CDN URLs.
// Idempotent — records already pointing at http(s) URLs are skipped.
// Local files are NOT deleted; clean up manually after verifying the site.
//
// Usage (on the server): node scripts/migrate-to-spaces.mjs
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const { SPACES_ENDPOINT, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET, SPACES_CDN_BASE, DATABASE_URL } = process.env;
if (!SPACES_ENDPOINT || !SPACES_BUCKET || !SPACES_KEY || !SPACES_SECRET || !SPACES_CDN_BASE) {
  console.error("SPACES_* env vars missing — configure .env first.");
  process.exit(1);
}
const cdnBase = SPACES_CDN_BASE.replace(/\/$/, "");

const s3 = new S3Client({
  endpoint: SPACES_ENDPOINT,
  region: "us-east-1",
  credentials: { accessKeyId: SPACES_KEY, secretAccessKey: SPACES_SECRET },
});

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4" };

async function migrateFile(localPath) {
  // localPath like /galleries/<id>/<file> or /reels/<file>
  const abs = path.join(root, "public", localPath);
  let body;
  try {
    body = await readFile(abs);
  } catch {
    console.warn(`  MISSING on disk, skipped: ${localPath}`);
    return null;
  }
  const key = localPath.replace(/^\//, "");
  const type = MIME[path.extname(localPath).toLowerCase()] || "application/octet-stream";
  await s3.send(new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: key,
    Body: body,
    ContentType: type,
    ACL: "public-read",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return `${cdnBase}/${key}`;
}

const db = new pg.Client({ connectionString: DATABASE_URL });
await db.connect();

try {
  let migrated = 0, skipped = 0;
  // Cache: same file may be referenced by Image.path AND Gallery.coverImage
  const urlCache = new Map();
  const toUrl = async (p) => {
    if (urlCache.has(p)) return urlCache.get(p);
    const u = await migrateFile(p);
    urlCache.set(p, u);
    return u;
  };

  console.log("— Images —");
  const images = await db.query(`SELECT id, path FROM "Image" WHERE path LIKE '/galleries/%'`);
  for (const row of images.rows) {
    const url = await toUrl(row.path);
    if (!url) { skipped++; continue; }
    await db.query(`UPDATE "Image" SET path = $1 WHERE id = $2`, [url, row.id]);
    migrated++;
  }

  console.log("— Gallery covers —");
  const covers = await db.query(`SELECT id, "coverImage" FROM "Gallery" WHERE "coverImage" LIKE '/galleries/%'`);
  for (const row of covers.rows) {
    const url = await toUrl(row.coverImage);
    if (!url) { skipped++; continue; }
    await db.query(`UPDATE "Gallery" SET "coverImage" = $1 WHERE id = $2`, [url, row.id]);
    migrated++;
  }

  console.log("— Reels —");
  const reels = await db.query(`SELECT id, "sourceUrl", "thumbnailUrl" FROM "SocialVideo"`);
  for (const row of reels.rows) {
    for (const [col, val] of [["sourceUrl", row.sourceUrl], ["thumbnailUrl", row.thumbnailUrl]]) {
      if (!val || !val.startsWith("/reels/")) continue;
      const url = await toUrl(val);
      if (!url) { skipped++; continue; }
      await db.query(`UPDATE "SocialVideo" SET "${col}" = $1 WHERE id = $2`, [url, row.id]);
      migrated++;
    }
  }

  console.log(`\nDone: ${migrated} references migrated, ${skipped} skipped (missing files).`);
  console.log("Local files were kept — verify the site, then remove public/galleries and public/reels to free disk.");
} finally {
  await db.end();
}
