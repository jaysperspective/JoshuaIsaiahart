import { serveUpload } from "@/app/lib/serve-upload";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return serveUpload(request, "reels", filename);
}
