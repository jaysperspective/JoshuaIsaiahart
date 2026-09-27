import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/app/lib/admin-auth";
import { spacesConfigured, createFolderMarker } from "@/app/lib/storage";

function cleanKey(s: string): string {
  return s
    .replace(/^\/+/, "")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
}

// POST /api/files/folder  { prefix: "parent/", name: "New Folder" }
// Creates an empty folder marker at "<prefix><name>/".
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  if (!spacesConfigured) {
    return NextResponse.json({ error: "Cloud storage not configured" }, { status: 501 });
  }
  try {
    const { prefix = "", name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 });
    }
    const parent = cleanKey(prefix);
    const folder = cleanKey(name);
    if (!folder) return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    const full = `${parent ? `${parent}/` : ""}${folder}/`;
    await createFolderMarker(full);
    return NextResponse.json({ success: true, prefix: full }, { status: 201 });
  } catch (e) {
    console.error("Failed to create folder:", e);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
