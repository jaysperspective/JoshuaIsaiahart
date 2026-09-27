import { NextRequest, NextResponse } from "next/server";
import Busboy from "busboy";
import { Readable } from "stream";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import {
  spacesConfigured,
  listObjects,
  uploadToSpaces,
  deleteFromSpaces,
  deletePrefix,
  keyToUrl,
} from "@/app/lib/storage";

// Normalize a user-supplied key: no leading slashes, no "." / ".." segments.
function cleanKey(s: string): string {
  return s
    .replace(/^\/+/, "")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
}

function normalizePrefix(p: string): string {
  const c = cleanKey(p);
  return c ? `${c}/` : "";
}

interface ParsedFile {
  fieldname: string;
  buffer: Buffer;
  filename: string;
  mimetype: string;
}
interface Parsed {
  fields: Record<string, string>;
  files: ParsedFile[];
}

function parseMultipart(req: NextRequest): Promise<Parsed> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type") || "";
    const bb = Busboy({
      headers: { "content-type": contentType },
      limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB per file (raw originals)
    });
    const fields: Record<string, string> = {};
    const files: ParsedFile[] = [];

    bb.on("field", (name, val) => {
      fields[name] = val;
    });
    bb.on("file", (fieldname, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on("data", (c) => chunks.push(c));
      stream.on("end", () => {
        files.push({
          fieldname,
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimetype: info.mimeType || "application/octet-stream",
        });
      });
      stream.on("error", reject);
    });
    bb.on("finish", () => resolve({ fields, files }));
    bb.on("error", reject);

    req
      .arrayBuffer()
      .then((ab) => Readable.from(Buffer.from(ab)).pipe(bb))
      .catch(reject);
  });
}

// GET /api/files?prefix=  → one folder level (folders + files)
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  const raw = new URL(request.url).searchParams.get("prefix") || "";
  const prefix = normalizePrefix(raw);
  try {
    const listing = await listObjects(prefix);
    return NextResponse.json(listing);
  } catch (e) {
    console.error("Failed to list objects:", e);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

// POST /api/files  (multipart)  → upload raw files (no compression).
// Each file field name is the file's relative path (e.g. "folder/sub/a.jpg");
// a "prefix" text field sets the destination folder.
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  try {
    const { fields, files } = await parseMultipart(request);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    const prefix = normalizePrefix(fields.prefix || "");

    const uploaded: { key: string; url: string }[] = [];
    for (const f of files) {
      // Prefer the relative path carried in the field name; fall back to filename.
      const rel = cleanKey(f.fieldname && f.fieldname !== "files" ? f.fieldname : f.filename);
      if (!rel) continue;
      const key = `${prefix}${rel}`;
      const url = await uploadToSpaces(key, f.buffer, f.mimetype);
      uploaded.push({ key, url });
    }

    return NextResponse.json({ uploaded }, { status: 201 });
  } catch (e) {
    console.error("Failed to upload files:", e);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}

// DELETE /api/files?key=<key>   (single object)
// DELETE /api/files?prefix=<p>  (recursive folder delete)
export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  const sp = new URL(request.url).searchParams;
  const key = sp.get("key");
  const prefixParam = sp.get("prefix");
  try {
    if (key) {
      const clean = cleanKey(key);
      if (!clean) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      await deleteFromSpaces(keyToUrl(clean));
      return NextResponse.json({ success: true, deleted: 1 });
    }
    if (prefixParam) {
      const prefix = normalizePrefix(prefixParam);
      if (!prefix) return NextResponse.json({ error: "Invalid prefix" }, { status: 400 });
      const count = await deletePrefix(prefix);
      return NextResponse.json({ success: true, deleted: count });
    }
    return NextResponse.json({ error: "key or prefix required" }, { status: 400 });
  } catch (e) {
    console.error("Failed to delete:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
