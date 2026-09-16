import { serveUpload } from "@/app/lib/serve-upload";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return serveUpload("reels", filename);
}
