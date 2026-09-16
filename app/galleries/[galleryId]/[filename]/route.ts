import { serveUpload } from "@/app/lib/serve-upload";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ galleryId: string; filename: string }> }
) {
  const { galleryId, filename } = await params;
  return serveUpload("galleries", galleryId, filename);
}
