import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

// DigitalOcean Spaces (S3-compatible) — when configured, uploads go to the
// CDN bucket instead of the droplet's disk. Without these env vars every
// upload route falls back to local public/ storage, so local dev and a
// keyless deploy keep working unchanged.
//
// .env (server):
//   SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
//   SPACES_BUCKET=<bucket name>
//   SPACES_KEY=<access key>
//   SPACES_SECRET=<secret>
//   SPACES_CDN_BASE=https://<bucket>.nyc3.cdn.digitaloceanspaces.com

const endpoint = process.env.SPACES_ENDPOINT;
const bucket = process.env.SPACES_BUCKET;
const cdnBase = process.env.SPACES_CDN_BASE?.replace(/\/$/, "");

export const spacesConfigured = Boolean(
  endpoint && bucket && cdnBase && process.env.SPACES_KEY && process.env.SPACES_SECRET
);

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint,
      region: "us-east-1", // ignored by Spaces but required by the SDK
      credentials: {
        accessKeyId: process.env.SPACES_KEY!,
        secretAccessKey: process.env.SPACES_SECRET!,
      },
    });
  }
  return client;
}

export async function uploadToSpaces(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${cdnBase}/${key}`;
}

// No-op for URLs that aren't in our bucket (legacy local paths, embeds)
export async function deleteFromSpaces(url: string | null | undefined): Promise<void> {
  if (!url || !cdnBase || !url.startsWith(`${cdnBase}/`)) return;
  const key = url.slice(cdnBase.length + 1);
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (e) {
    console.error("Failed to delete from Spaces:", key, e);
  }
}

// ---------------------------------------------------------------------------
// File-manager helpers — browse/manage the bucket directly (admin only).
// ---------------------------------------------------------------------------

export const CDN_BASE = cdnBase;

export function keyToUrl(key: string): string {
  return `${cdnBase}/${key}`;
}

// Returns the object key for a URL in our bucket, or null if it isn't ours.
export function urlToKey(url: string | null | undefined): string | null {
  if (!url || !cdnBase || !url.startsWith(`${cdnBase}/`)) return null;
  return url.slice(cdnBase.length + 1);
}

export interface SpacesFolder {
  prefix: string; // full prefix incl. trailing slash, e.g. "galleries/abc/"
  name: string; // last path segment, e.g. "abc"
}
export interface SpacesFile {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  url: string;
}
export interface SpacesListing {
  prefix: string;
  folders: SpacesFolder[];
  files: SpacesFile[];
}

// List one "level" of the bucket at `prefix` (Dropbox-style folder view).
// Uses Delimiter "/" so sub-prefixes come back as folders. Paginates fully.
export async function listObjects(prefix = ""): Promise<SpacesListing> {
  const folders: SpacesFolder[] = [];
  const files: SpacesFile[] = [];
  let token: string | undefined;

  do {
    const res = await getClient().send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        Delimiter: "/",
        ContinuationToken: token,
      })
    );

    for (const cp of res.CommonPrefixes || []) {
      const p = cp.Prefix!;
      const name = p.slice(prefix.length).replace(/\/$/, "");
      if (name) folders.push({ prefix: p, name });
    }

    for (const obj of res.Contents || []) {
      const key = obj.Key!;
      if (key === prefix) continue; // the folder marker itself
      const name = key.slice(prefix.length);
      if (!name || name.endsWith("/")) continue; // markers / nested
      files.push({
        key,
        name,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified ? obj.LastModified.toISOString() : null,
        url: keyToUrl(key),
      });
    }

    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  folders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));
  return { prefix, folders, files };
}

// Every object key under a prefix (recursive), paginated.
async function listAllKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await getClient().send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );
    for (const obj of res.Contents || []) if (obj.Key) keys.push(obj.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

// Recursively delete everything under a prefix (in ≤1000-key batches).
export async function deletePrefix(prefix: string): Promise<number> {
  if (!prefix) throw new Error("Refusing to delete empty prefix");
  const keys = await listAllKeys(prefix);
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await getClient().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })) },
      })
    );
  }
  return keys.length;
}

// Create an empty "folder" by writing a zero-byte marker at "<prefix>/".
export async function createFolderMarker(prefix: string): Promise<void> {
  const key = prefix.endsWith("/") ? prefix : `${prefix}/`;
  await getClient().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.alloc(0) })
  );
}

// Copy one object to a new key (S3/Spaces has no native rename/move).
async function copyObject(srcKey: string, destKey: string): Promise<void> {
  // CopySource must be "bucket/key" with each path segment URL-encoded but
  // slashes preserved (keys can contain spaces / special chars).
  const source = `${bucket}/${srcKey}`
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  await getClient().send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: source,
      Key: destKey,
      ACL: "public-read",
      MetadataDirective: "COPY",
    })
  );
}

// Rename a single object (copy to new key, delete old). Returns new URL.
export async function renameKey(oldKey: string, newKey: string): Promise<string> {
  if (!oldKey || !newKey || oldKey === newKey) return keyToUrl(oldKey);
  await copyObject(oldKey, newKey);
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: oldKey }));
  return keyToUrl(newKey);
}

// Rename a "folder": copy every object under oldPrefix to newPrefix, then
// delete the old prefix. Both prefixes must end in "/". Returns object count.
export async function renamePrefix(oldPrefix: string, newPrefix: string): Promise<number> {
  if (!oldPrefix || !newPrefix) throw new Error("Both prefixes required");
  if (oldPrefix === newPrefix) return 0;
  const keys = await listAllKeys(oldPrefix);
  for (const key of keys) {
    const dest = newPrefix + key.slice(oldPrefix.length);
    // eslint-disable-next-line no-await-in-loop
    await copyObject(key, dest);
  }
  await deletePrefix(oldPrefix);
  return keys.length;
}

// Recursively collect image files under a prefix (for "share as album").
export async function listImagesRecursive(prefix: string): Promise<SpacesFile[]> {
  const keys = await listAllKeys(prefix);
  const IMG = /\.(jpe?g|png|webp|gif|avif|heic|heif|tiff?)$/i;
  return keys
    .filter((k) => !k.endsWith("/") && IMG.test(k))
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key,
      name: key.slice(key.lastIndexOf("/") + 1),
      size: 0,
      lastModified: null,
      url: keyToUrl(key),
    }));
}
