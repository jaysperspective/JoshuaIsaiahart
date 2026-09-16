import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
