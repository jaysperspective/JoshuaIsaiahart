import { serveUpload } from "@/app/lib/serve-upload";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ galleryId: string; filename: string }> }
) {
  const { galleryId, filename } = await params;
  return serveUpload(request, "galleries", galleryId, filename);
}
