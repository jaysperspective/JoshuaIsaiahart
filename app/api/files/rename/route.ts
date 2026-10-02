import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import { spacesConfigured, renameKey, renamePrefix, keyToUrl } from "@/app/lib/storage";
import { rewriteSpacesUrlRefs } from "@/app/lib/url-refs";

// A single safe path segment (no slashes, no "." / "..").
function cleanSegment(s: string): string {
  return s.replace(/[/\\]+/g, " ").replace(/\s+/g, " ").trim().replace(/^\.+$/, "");
}
function cleanKey(s: string): string {
  return s
    .replace(/^\/+/, "")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
}

// POST /api/files/rename
//   folder: { prefix: "parent/old/", newName: "new" }
//   file:   { key: "parent/old.jpg",  newName: "new.jpg" }
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  try {
    const { prefix, key, newName } = await request.json();
    const name = cleanSegment(String(newName || ""));
    if (!name) return NextResponse.json({ error: "New name required" }, { status: 400 });

    // Folder rename
    if (prefix) {
      const old = cleanKey(prefix); // no trailing slash
      if (!old) return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
      const parts = old.split("/");
      parts[parts.length - 1] = name;
      const newPrefix = `${parts.join("/")}/`;
      const oldPrefix = `${old}/`;
      if (newPrefix === oldPrefix) return NextResponse.json({ success: true, prefix: newPrefix });
      const count = await renamePrefix(oldPrefix, newPrefix);
      // Keep DB URLs (gallery photos, covers, thumbnails) pointing at the
      // moved objects — otherwise the rename orphans them and they 404.
      const relinked = await rewriteSpacesUrlRefs(oldPrefix, newPrefix);
      return NextResponse.json({ success: true, prefix: newPrefix, moved: count, relinked });
    }

    // File rename
    if (key) {
      const old = cleanKey(key);
      if (!old) return NextResponse.json({ error: "Invalid file" }, { status: 400 });
      const slash = old.lastIndexOf("/");
      const dir = slash >= 0 ? old.slice(0, slash + 1) : "";
      const oldBase = old.slice(slash + 1);
      // Keep the original extension if the new name doesn't include one.
      const oldExt = oldBase.includes(".") ? oldBase.slice(oldBase.lastIndexOf(".")) : "";
      const finalName = name.includes(".") ? name : name + oldExt;
      const newKey = dir + finalName;
      if (newKey === old) return NextResponse.json({ success: true, key: old, url: keyToUrl(old) });
      const url = await renameKey(old, newKey);
      const relinked = await rewriteSpacesUrlRefs(old, newKey);
      return NextResponse.json({ success: true, key: newKey, url, relinked });
    }

    return NextResponse.json({ error: "prefix or key required" }, { status: 400 });
  } catch (e) {
    console.error("Failed to rename:", e);
    return NextResponse.json({ error: "Failed to rename" }, { status: 500 });
  }
}
